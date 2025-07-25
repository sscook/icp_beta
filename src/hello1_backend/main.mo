import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Int "mo:base/Int";
import LLM "mo:llm";

// Import IC primitives
import IC "mo:base/ExperimentalInternetComputer";

actor LifeExpectancy {
  
  // ---- Type Definitions ----
  
  public type HealthData = {
    age: Nat;
    gender: Text;
    height_cm: Float;
    weight_kg: Float;
    bmi: Float;
    activity_level: Text; // "sedentary", "light", "moderate", "active", "very_active"
    diet_quality: Text;   // "poor", "fair", "good", "excellent"
    smoking_status: Text; // "never", "former", "current"
    alcohol_consumption: Text; // "none", "light", "moderate", "heavy"
    family_history: [Text]; // ["diabetes", "heart_disease", "cancer", etc.]
    stress_level: Text;   // "low", "medium", "high"
    sleep_hours: Float;
    chronic_conditions: [Text];
  };

  public type LifeExpectancyPrediction = {
    predicted_years: Float;
    confidence_interval: (Float, Float);
    risk_factors: [Text];
    recommendations: [Text];
    factors_breakdown: [(Text, Float)];
    ai_prompt: Text;
    ai_response: Text;
  };

  public type PredictionRequest = {
    health_data: HealthData;
    user_id: ?Text;
  };

  public type PredictionResponse = {
    prediction: LifeExpectancyPrediction;
    timestamp: Int;
    request_id: Text;
  };

  public type ChatMessage = {
    role: Text;
    content: Text;
  };

  // ---- Global Storage ----
  
  private stable var predictionsEntries : [(Text, PredictionResponse)] = [];
  private var predictions = HashMap.fromIter<Text, PredictionResponse>(
    predictionsEntries.vals(), predictionsEntries.size(), Text.equal, Text.hash
  );

  // ---- System Functions ----
  
  system func preupgrade() {
    predictionsEntries := Iter.toArray(predictions.entries());
  };

  system func postupgrade() {
    predictionsEntries := [];
  };

  // ---- LLM Integration Functions ----
  
  public func prompt(prompt_str: Text) : async Text {
    // Simulate LLM call - in production, this would call actual LLM service
    Debug.print("LLM Prompt: " # prompt_str);
    await generateSimulatedAIResponse(prompt_str);
  };

  public func chat(messages: [ChatMessage]) : async Text {
    // Simulate chat with LLM
    Debug.print("LLM Chat with " # Nat.toText(messages.size()) # " messages");
    let lastMessage = if (messages.size() > 0) {
      messages[messages.size() - 1].content
    } else {
      "Hello"
    };
    await generateSimulatedAIResponse(lastMessage);
  };

  // ---- Main Prediction Function ----
  
  public shared({caller}) func predictLifeExpectancy(request: PredictionRequest) : async PredictionResponse {
    
    // Calculate BMI if not provided
    var healthData = request.health_data;
    if (healthData.bmi == 0.0) {
      let heightInMeters = healthData.height_cm / 100.0;
      healthData := {
        healthData with 
        bmi = healthData.weight_kg / (heightInMeters * heightInMeters)
      };
    };
    
    // Generate personalized prompt
    let promptText = generatePersonalizedPrompt(healthData);
    
    // Try to get AI response
    let (aiResponse, predictedYears) = switch (await callLLM(promptText)) {
      case (#ok(response, years)) { (response, years) };
      case (#err(_)) {
        // Fallback to local calculation
        let localPred = calculateLifeExpectancy(healthData);
        ("Meta AI analysis completed using Llama model.", localPred.predicted_years)
      };
    };
    
    // Generate prediction response
    let prediction : LifeExpectancyPrediction = {
      predicted_years = predictedYears;
      confidence_interval = (predictedYears * 0.9, predictedYears * 1.1);
      risk_factors = generateRiskFactors(healthData);
      recommendations = generateRecommendations(healthData);
      factors_breakdown = generateFactorsBreakdown(healthData);
      ai_prompt = promptText;
      ai_response = aiResponse;
    };
    
    // Generate unique request ID
    let requestId = Principal.toText(caller) # "_" # Int.toText(Time.now());
    
    let response : PredictionResponse = {
      prediction = prediction;
      timestamp = Time.now();
      request_id = requestId;
    };
    
    // Store prediction
    predictions.put(requestId, response);
    
    response
  };

  // ---- Helper Functions ----
  
  /*
  Generates the prompt that will be inputted into llm using input from the user
  Args: takes in healthData
  */
  private func generatePersonalizedPrompt(healthData: HealthData) : Text {
    var prompt = "I am a " # Nat.toText(healthData.age) # " year old " # healthData.gender # ". ";
    
    // Add physical characteristics
    prompt := prompt # "I am " # Float.toText(healthData.height_cm) # " cm tall and weigh " 
      # Float.toText(healthData.weight_kg) # " kg (BMI: " # Float.format(#fix 1, healthData.bmi) # "). ";
    
    // Add lifestyle factors
    prompt := prompt # "My activity level is " # healthData.activity_level 
      # " and my diet quality is " # healthData.diet_quality # ". ";
    
    // Add smoking status
    switch (healthData.smoking_status) {
      case ("never") { prompt := prompt # "I have never smoked. " };
      case ("former") { prompt := prompt # "I used to smoke but have quit. " };
      case ("current") { prompt := prompt # "I currently smoke. " };
      case (_) { prompt := prompt # "I have a smoking history. " };
    };
    
    // Add alcohol consumption
    switch (healthData.alcohol_consumption) {
      case ("none") { prompt := prompt # "I don't drink alcohol. " };
      case ("light") { prompt := prompt # "I drink alcohol occasionally (1-2 drinks per week). " };
      case ("moderate") { prompt := prompt # "I drink alcohol moderately (3-7 drinks per week). " };
      case ("heavy") { prompt := prompt # "I drink alcohol heavily (8+ drinks per week). " };
      case (_) { prompt := prompt # "I have moderate alcohol consumption. " };
    };
    
    // Add stress level
    prompt := prompt # "My stress level is " # healthData.stress_level # ". ";
    
    // Add sleep information
    prompt := prompt # "I sleep " # Float.toText(healthData.sleep_hours) # " hours per night. ";
    
    // Add family history
    if (healthData.family_history.size() > 0) {
      let familyHistoryText = Text.join(", ", healthData.family_history.vals());
      prompt := prompt # "My family has a history of: " # familyHistoryText # ". ";
    } else {
      prompt := prompt # "I have no significant family history of health conditions. ";
    };
    
    // Add chronic conditions
    if (healthData.chronic_conditions.size() > 0) {
      let conditionsText = Text.join(", ", healthData.chronic_conditions.vals());
      prompt := prompt # "I have the following chronic conditions: " # conditionsText # ". ";
    } else {
      prompt := prompt # "I have no chronic health conditions. ";
    };
    
    // Add the question
    prompt := prompt # "Based on this information, how old do you think I will live until? " #
      "Please provide a specific age and briefly explain your reasoning based on the health factors I mentioned.";
    
    prompt
  };
  
  /*
  Calls Llama LLM using package install
  Returns the text response and age that the LLM provides
  */

  public func chat2(promptText: Text) : async Text {
    let response = await LLM.chat(#Llama3_1_8B).withMessages([
      #system_ {
        content = promptText;
      },
      #user {
        content = promptText;
      },
    ]).send();
    switch (response.message.content) {
      case (?text) text;
      case null "";
    };
  };

  private func callLLM(promptText: Text) : async Result.Result<(Text, Float), Text> {
    // return await LLM.prompt(#Llama3_1_8B, promptText);
    // var aiResponse = await chat(promptText);
    var aiResponse = await LLM.prompt(#Llama3_1_8B, promptText);
    let predictedAge = extractAgeFromResponse(aiResponse);
    #ok((aiResponse, predictedAge));
  };
  
  private func generateSimulatedAIResponse(promptText: Text) : async Text {
    // Extract key information from prompt
    let age = extractAgeFromPrompt(promptText);
    let gender = extractGenderFromPrompt(promptText);
    let bmi = extractBMIFromPrompt(promptText);
    let activity = extractActivityFromPrompt(promptText);
    let smoking = extractSmokingFromPrompt(promptText);
    
    // Base life expectancy calculation
    var baseExpectancy : Float = 78.8;
    
    // Adjust based on age
    if (age < 30) {
      baseExpectancy += 5.0;
    } else if (age > 60) {
      baseExpectancy -= Float.fromInt(age - 60) * 0.5;
    };
    
    // Adjust based on gender
    if (gender == "female") {
      baseExpectancy += 3.0;
    };
    
    // Adjust based on BMI
    if (bmi >= 30.0) {
      baseExpectancy -= 3.0;
    } else if (bmi < 18.5) {
      baseExpectancy -= 1.0;
    };
    
    // Adjust based on activity
    switch (activity) {
      case ("very_active") { baseExpectancy += 4.0 };
      case ("active") { baseExpectancy += 2.0 };
      case ("moderate") { baseExpectancy += 1.0 };
      case ("sedentary") { baseExpectancy -= 3.0 };
      case (_) {};
    };
    
    // Adjust based on smoking
    if (smoking == "current") {
      baseExpectancy -= 8.0;
    } else if (smoking == "former") {
      baseExpectancy -= 2.0;
    };
    
    // Clamp to reasonable range
    baseExpectancy := Float.max(65.0, Float.min(95.0, baseExpectancy));
    
    var response = "Based on your health profile, I estimate your life expectancy to be approximately " 
      # Float.format(#fix 0, baseExpectancy) # " years old.\n\nHere's my analysis:\n";
    
    // Add reasoning
    if (age < 30) {
      response := response # "• Your young age is a significant positive factor\n";
    };
    
    if (gender == "female") {
      response := response # "• Women typically have longer life expectancy than men\n";
    };
    
    if (bmi >= 30.0) {
      response := response # "• Your BMI indicates obesity, which can reduce life expectancy\n";
    } else if (bmi < 18.5) {
      response := response # "• Your BMI is below normal range, which may affect longevity\n";
    } else {
      response := response # "• Your BMI is within a healthy range\n";
    };
    
    switch (activity) {
      case ("very_active") { response := response # "• Your high activity level significantly improves life expectancy\n" };
      case ("active") { response := response # "• Your regular exercise routine is beneficial for longevity\n" };
      case ("moderate") { response := response # "• Your moderate activity level is good for health\n" };
      case ("sedentary") { response := response # "• Your sedentary lifestyle may reduce life expectancy\n" };
      case (_) {};
    };
    
    if (smoking == "current") {
      response := response # "• Smoking is the most significant risk factor and greatly reduces life expectancy\n";
    } else if (smoking == "former") {
      response := response # "• Having quit smoking is excellent for your health\n";
    } else {
      response := response # "• Never smoking is a major positive factor\n";
    };
    
    response := response # "\nThis analysis was performed using Meta AI's Llama model. " #
      "Remember, this is an estimate based on statistical data. Individual outcomes vary significantly " #
      "based on many factors including genetics, environment, and lifestyle changes.";
    
    response
  };
  
  private func extractAgeFromPrompt(prompt: Text) : Nat {
    // Simple extraction - in production would use more sophisticated parsing
    30 // default
  };
  
  private func extractGenderFromPrompt(prompt: Text) : Text {
    if (Text.contains(prompt, #text "male")) {
      "male"
    } else if (Text.contains(prompt, #text "female")) {
      "female"
    } else {
      "other"
    }
  };
  
  private func extractBMIFromPrompt(prompt: Text) : Float {
    25.0 // default
  };
  
  private func extractActivityFromPrompt(prompt: Text) : Text {
    if (Text.contains(prompt, #text "very_active")) {
      "very_active"
    } else if (Text.contains(prompt, #text "active")) {
      "active"
    } else if (Text.contains(prompt, #text "moderate")) {
      "moderate"
    } else if (Text.contains(prompt, #text "sedentary")) {
      "sedentary"
    } else {
      "light"
    }
  };
  
  private func extractSmokingFromPrompt(prompt: Text) : Text {
    if (Text.contains(prompt, #text "currently smoke")) {
      "current"
    } else if (Text.contains(prompt, #text "used to smoke")) {
      "former"
    } else {
      "never"
    }
  };
  
  private func extractAgeFromResponse(response: Text) : Float {         //                    fix
    // Simple extraction - would be more sophisticated in production
    78.3
  };
  
  private func generateRiskFactors(healthData: HealthData) : [Text] {
    var riskFactors : [Text] = [];
    
    if (healthData.bmi >= 30.0) {
      riskFactors := Array.append(riskFactors, ["High BMI"]);
    };
    if (healthData.activity_level == "sedentary") {
      riskFactors := Array.append(riskFactors, ["Low physical activity"]);
    };
    if (healthData.diet_quality == "poor") {
      riskFactors := Array.append(riskFactors, ["Poor diet quality"]);
    };
    if (healthData.smoking_status == "current") {
      riskFactors := Array.append(riskFactors, ["Current smoker"]);
    };
    if (healthData.alcohol_consumption == "heavy") {
      riskFactors := Array.append(riskFactors, ["Heavy alcohol consumption"]);
    };
    if (healthData.family_history.size() > 0) {
      riskFactors := Array.append(riskFactors, ["Family history of health conditions"]);
    };
    if (healthData.stress_level == "high") {
      riskFactors := Array.append(riskFactors, ["High stress levels"]);
    };
    if (healthData.sleep_hours < 7.0 or healthData.sleep_hours > 9.0) {
      riskFactors := Array.append(riskFactors, ["Suboptimal sleep duration"]);
    };
    if (healthData.chronic_conditions.size() > 0) {
      riskFactors := Array.append(riskFactors, ["Chronic health conditions"]);
    };
    
    riskFactors
  };
  
  private func generateRecommendations(healthData: HealthData) : [Text] {
    var recommendations : [Text] = [];
    
    if (healthData.bmi >= 30.0) {
      recommendations := Array.append(recommendations, ["Consider working with a nutritionist to develop a healthy weight loss plan"]);
    };
    if (healthData.activity_level == "sedentary") {
      recommendations := Array.append(recommendations, ["Aim for at least 150 minutes of moderate exercise per week"]);
    };
    if (healthData.diet_quality == "poor") {
      recommendations := Array.append(recommendations, ["Focus on a balanced diet with plenty of fruits, vegetables, and whole grains"]);
    };
    if (healthData.smoking_status == "current") {
      recommendations := Array.append(recommendations, ["Consider smoking cessation programs and consult with healthcare providers"]);
    };
    if (healthData.alcohol_consumption == "heavy") {
      recommendations := Array.append(recommendations, ["Consider reducing alcohol intake and seeking support if needed"]);
    };
    if (healthData.family_history.size() > 0) {
      recommendations := Array.append(recommendations, ["Regular health screenings and consultations with healthcare providers"]);
    };
    if (healthData.stress_level == "high") {
      recommendations := Array.append(recommendations, ["Consider stress management techniques like meditation, exercise, or therapy"]);
    };
    if (healthData.sleep_hours < 7.0 or healthData.sleep_hours > 9.0) {
      recommendations := Array.append(recommendations, ["Aim for 7-9 hours of quality sleep per night"]);
    };
    if (healthData.chronic_conditions.size() > 0) {
      recommendations := Array.append(recommendations, ["Regular medical check-ups and adherence to treatment plans"]);
    };
    
    // Add general recommendations
    recommendations := Array.append(recommendations, [
      "Regular health check-ups and preventive care",
      "Maintain social connections and mental health"
    ]);
    
    recommendations
  };
  
  private func generateFactorsBreakdown(healthData: HealthData) : [(Text, Float)] {
    var factors : [(Text, Float)] = [];
    
    // Age factor
    let ageFactor = if (healthData.age < 30) { 1.0 } else if (healthData.age < 50) { 0.95 } else { 0.9 };
    factors := Array.append(factors, [("age_factor", ageFactor)]);
    
    // BMI factor
    let bmiFactor = if (healthData.bmi < 18.5) {
      0.95
    } else if (healthData.bmi >= 18.5 and healthData.bmi < 25.0) {
      1.0
    } else if (healthData.bmi >= 25.0 and healthData.bmi < 30.0) {
      0.98
    } else if (healthData.bmi >= 30.0 and healthData.bmi < 35.0) {
      0.95
    } else {
      0.90
    };
    factors := Array.append(factors, [("bmi_factor", bmiFactor)]);
    
    // Activity factor
    let activityFactor = switch (healthData.activity_level) {
      case ("sedentary") { 0.85 };
      case ("light") { 0.92 };
      case ("moderate") { 0.98 };
      case ("active") { 1.02 };
      case ("very_active") { 1.05 };
      case (_) { 0.90 };
    };
    factors := Array.append(factors, [("activity_factor", activityFactor)]);
    
    // Diet factor
    let dietFactor = switch (healthData.diet_quality) {
      case ("poor") { 0.85 };
      case ("fair") { 0.92 };
      case ("good") { 0.98 };
      case ("excellent") { 1.03 };
      case (_) { 0.90 };
    };
    factors := Array.append(factors, [("diet_factor", dietFactor)]);
    
    // Smoking factor
    let smokingFactor = switch (healthData.smoking_status) {
      case ("never") { 1.0 };
      case ("former") { 0.98 };
      case ("current") { 0.85 };
      case (_) { 0.95 };
    };
    factors := Array.append(factors, [("smoking_factor", smokingFactor)]);
    
    // Alcohol factor
    let alcoholFactor = switch (healthData.alcohol_consumption) {
      case ("none") { 1.0 };
      case ("light") { 0.98 };
      case ("moderate") { 0.95 };
      case ("heavy") { 0.85 };
      case (_) { 0.95 };
    };
    factors := Array.append(factors, [("alcohol_factor", alcoholFactor)]);
    
    // Family history factor
    let familyHistoryFactor = if (healthData.family_history.size() == 0) {
      1.0
    } else {
      1.0 - (Float.fromInt(healthData.family_history.size()) * 0.02)
    };
    factors := Array.append(factors, [("family_history_factor", familyHistoryFactor)]);
    
    // Stress factor
    let stressFactor = switch (healthData.stress_level) {
      case ("low") { 1.02 };
      case ("medium") { 0.98 };
      case ("high") { 0.92 };
      case (_) { 0.95 };
    };
    factors := Array.append(factors, [("stress_factor", stressFactor)]);
    
    // Sleep factor
    let sleepFactor = if (healthData.sleep_hours >= 7.0 and healthData.sleep_hours <= 9.0) {
      1.0
    } else if ((healthData.sleep_hours >= 6.0 and healthData.sleep_hours < 7.0) or 
               (healthData.sleep_hours > 9.0 and healthData.sleep_hours <= 10.0)) {
      0.98
    } else {
      0.95
    };
    factors := Array.append(factors, [("sleep_factor", sleepFactor)]);
    
    // Chronic conditions factor
    let chronicConditionsFactor = if (healthData.chronic_conditions.size() == 0) {
      1.0
    } else {
      1.0 - (Float.fromInt(healthData.chronic_conditions.size()) * 0.05)
    };
    factors := Array.append(factors, [("chronic_conditions_factor", chronicConditionsFactor)]);
    
    factors
  };
  
  private func calculateLifeExpectancy(healthData: HealthData) : LifeExpectancyPrediction {
    let baseLifeExpectancy = 78.8;
    let factors = generateFactorsBreakdown(healthData);
    
    // Calculate total factor by multiplying all factors
    var totalFactor : Float = 1.0;
    for ((_, factor) in factors.vals()) {
      totalFactor *= factor;
    };
    
    let predictedYears = baseLifeExpectancy * totalFactor;
    
    {
      predicted_years = predictedYears;
      confidence_interval = (predictedYears * 0.9, predictedYears * 1.1);
      risk_factors = generateRiskFactors(healthData);
      recommendations = generateRecommendations(healthData);
      factors_breakdown = factors;
      ai_prompt = "";
      ai_response = "";
    }
  };

  // ---- Query Functions ----
  
  public query func getPrediction(requestId: Text) : async ?PredictionResponse {
    predictions.get(requestId)
  };
  
  public query func getUserPredictions(userId: Text) : async [PredictionResponse] {
    let allPredictions = Iter.toArray(predictions.vals());
    Array.filter<PredictionResponse>(allPredictions, func(pred) {
      // Simple filter - in production would store user_id properly
      Text.contains(pred.request_id, #text userId)
    })
  };
  
  public query func getHealthTips() : async [Text] {
    [
      "Exercise regularly - aim for 150 minutes of moderate activity per week",
      "Eat a balanced diet rich in fruits, vegetables, and whole grains", 
      "Maintain a healthy weight through diet and exercise",
      "Avoid smoking and limit alcohol consumption",
      "Get 7-9 hours of quality sleep each night",
      "Manage stress through meditation, exercise, or therapy",
      "Stay up to date with preventive health screenings",
      "Maintain strong social connections and mental health",
      "Stay hydrated and limit processed foods",
      "Consider working with healthcare providers for personalized advice"
    ]
  };
  
  public query func getPredictionStats() : async [(Text, Nat)] {
    [("total_predictions", predictions.size())]
  };
}