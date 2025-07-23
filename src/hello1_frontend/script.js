// //new file

// // Global variables
// let agent = null;
// let canisterId = null;

// // Initialize the application

// document.addEventListener('DOMContentLoaded', function() {
//     initializeApp();
//     setupEventListeners();
// });

// // Initialize the Internet Computer agent

// async function initializeApp() {
//     try {
//         // Check if we're in a browser environment
//         if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
//             // Production environment - connect to IC
//             const { HttpAgent } = await import('https://cdn.jsdelivr.net/npm/@dfinity/agent@0.15.0/dist/cjs/index.js');
//             agent = new HttpAgent({ host: 'https://ic0.app' });
//             await agent.fetchRootKey();
            
//             // Get canister ID from URL or use default
//             canisterId = window.location.hostname.split('.')[0];
//         } else {
//             // Local development
//             const { HttpAgent } = await import('https://cdn.jsdelivr.net/npm/@dfinity/agent@0.15.0/dist/cjs/index.js');
//             agent = new HttpAgent({ host: 'http://localhost:4943' });
//             await agent.fetchRootKey();
//             canisterId = 'rrkah-fqaaa-aaaaa-aaaaq-cai'; // Default local canister ID
//         }
        
//         console.log('Internet Computer agent initialized');
//     } catch (error) {
//         console.error('Failed to initialize IC agent:', error);
//         // Fallback to local calculation
//         showNotification('Using local calculation mode', 'info');
//     }
// }

// // Setup event listeners
// function setupEventListeners() {
//     const form = document.getElementById('healthForm');
//     if (form) {
//         form.addEventListener('submit', handleFormSubmit);
//     }
    
//     // Auto-calculate BMI when height or weight changes
//     const heightInput = document.getElementById('height');
//     const weightInput = document.getElementById('weight');
    
//     if (heightInput && weightInput) {
//         heightInput.addEventListener('input', calculateBMI);
//         weightInput.addEventListener('input', calculateBMI);
//     }
// }

// // Calculate BMI automatically
// function calculateBMI() {
//     const height = parseFloat(document.getElementById('height').value);
//     const weight = parseFloat(document.getElementById('weight').value);
    
//     if (height > 0 && weight > 0) {
//         const bmi = weight / Math.pow(height / 100, 2);
//         // You could display this somewhere if needed
//         console.log('Calculated BMI:', bmi.toFixed(1));
//     }
// }

// // Handle form submission
// async function handleFormSubmit(event) {
//     event.preventDefault();
    
//     const formData = new FormData(event.target);
//     const healthData = collectFormData(formData);
    
//     if (!validateFormData(healthData)) {
//         showNotification('Please fill in all required fields', 'error');
//         return;
//     }
    
//     showLoading(true);
    
//     try {
//         const prediction = await getLifeExpectancyPrediction(healthData);
//         displayResults(prediction);
//         showLoading(false);
//     } catch (error) {
//         console.error('Prediction error:', error);
//         showNotification('Failed to get prediction. Please try again.', 'error');
//         showLoading(false);
//     }
// }

// // Collect form data
// function collectFormData(formData) {
//     const healthData = {
//         age: parseInt(formData.get('age')),
//         gender: formData.get('gender'),
//         height_cm: parseFloat(formData.get('height')),
//         weight_kg: parseFloat(formData.get('weight')),
//         bmi: 0, // Will be calculated
//         activity_level: formData.get('activity'),
//         diet_quality: formData.get('diet'),
//         smoking_status: formData.get('smoking'),
//         alcohol_consumption: formData.get('alcohol'),
//         family_history: formData.getAll('family_history'),
//         stress_level: formData.get('stress'),
//         sleep_hours: parseFloat(formData.get('sleep')),
//         chronic_conditions: formData.getAll('chronic_conditions')
//     };
    
//     // Calculate BMI
//     if (healthData.height_cm > 0 && healthData.weight_kg > 0) {
//         healthData.bmi = healthData.weight_kg / Math.pow(healthData.height_cm / 100, 2);
//     }
    
//     return healthData;
// }



// // Validate form data
// function validateFormData(data) {
//     const requiredFields = ['age', 'gender', 'height_cm', 'weight_kg', 'activity_level', 
//                           'diet_quality', 'smoking_status', 'alcohol_consumption', 'stress_level', 'sleep_hours'];
    
//     for (const field of requiredFields) {
//         if (!data[field] || data[field] === '') {
//             return false;
//         }
//     }
    
//     return true;
// }

// // Get life expectancy prediction
// async function getLifeExpectancyPrediction(healthData) {
//     return await getICPrediction(healthData);
//     // if (agent && canisterId) {
//     //     // Use Internet Computer backend
//     //     return await getICPrediction(healthData);
//     // } else {
//     //     // Fallback to local calculation
//     //     return await getLocalPrediction(healthData);
//     // }
// }

// // Get prediction from Internet Computer
// async function getICPrediction(healthData) {
//     try {
//         const request = {
//             health_data: healthData,
//             user_id: null
//         };
        
//         // const response = await agent.call(canisterId, 'predict_life_expectancy', [request]);
//         const response = await backend.chat([request])
//         return response;
//     } catch (error) {
//         console.error('IC prediction error:', error);
//         throw error;
//     }
// }

// // Local prediction calculation (fallback)
// async function getLocalPrediction(healthData) {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     // Simple local calculation based on the same factors as backend
//     let baseLifeExpectancy = 78.8;
    
//     // Calculate factors similar to backend logic
//     const factors = calculateLocalFactors(healthData);
//     const totalFactor = Object.values(factors).reduce((a, b) => a * b, 1);
    
//     const predictedYears = baseLifeExpectancy * totalFactor;
//     const confidenceInterval = [predictedYears * 0.9, predictedYears * 1.1];
    
//     // Generate risk factors and recommendations
//     const riskFactors = generateRiskFactors(healthData);
//     const recommendations = generateRecommendations(healthData);
    
//     return {
//         prediction: {
//             predicted_years: predictedYears,
//             confidence_interval: confidenceInterval,
//             risk_factors: riskFactors,
//             recommendations: recommendations,
//             factors_breakdown: factors,
//             ai_prompt: generateLocalPrompt(healthData),
//             ai_response: "Meta AI analysis using Llama model - local calculation mode"
//         },
//         timestamp: Date.now(),
//         request_id: 'local_' + Date.now()
//     };
// }

// // Calculate local factors
// function calculateLocalFactors(healthData) {
//     const factors = {};
    
//     // Age factor
//     factors.age_factor = healthData.age < 30 ? 1.0 : healthData.age < 50 ? 0.95 : 0.9;
    
//     // BMI factor
//     if (healthData.bmi < 18.5) factors.bmi_factor = 0.95;
//     else if (healthData.bmi < 25.0) factors.bmi_factor = 1.0;
//     else if (healthData.bmi < 30.0) factors.bmi_factor = 0.98;
//     else if (healthData.bmi < 35.0) factors.bmi_factor = 0.95;
//     else factors.bmi_factor = 0.90;
    
//     // Activity factor
//     const activityFactors = {
//         'sedentary': 0.85,
//         'light': 0.92,
//         'moderate': 0.98,
//         'active': 1.02,
//         'very_active': 1.05
//     };
//     factors.activity_factor = activityFactors[healthData.activity_level] || 0.90;
    
//     // Diet factor
//     const dietFactors = {
//         'poor': 0.85,
//         'fair': 0.92,
//         'good': 0.98,
//         'excellent': 1.03
//     };
//     factors.diet_factor = dietFactors[healthData.diet_quality] || 0.90;
    
//     // Smoking factor
//     const smokingFactors = {
//         'never': 1.0,
//         'former': 0.98,
//         'current': 0.85
//     };
//     factors.smoking_factor = smokingFactors[healthData.smoking_status] || 0.95;
    
//     // Alcohol factor
//     const alcoholFactors = {
//         'none': 1.0,
//         'light': 0.98,
//         'moderate': 0.95,
//         'heavy': 0.85
//     };
//     factors.alcohol_factor = alcoholFactors[healthData.alcohol_consumption] || 0.95;
    
//     // Family history factor
//     factors.family_history_factor = healthData.family_history.length === 0 ? 
//         1.0 : 1.0 - (healthData.family_history.length * 0.02);
    
//     // Stress factor
//     const stressFactors = {
//         'low': 1.02,
//         'medium': 0.98,
//         'high': 0.92
//     };
//     factors.stress_factor = stressFactors[healthData.stress_level] || 0.95;
    
//     // Sleep factor
//     if (healthData.sleep_hours >= 7.0 && healthData.sleep_hours <= 9.0) {
//         factors.sleep_factor = 1.0;
//     } else if (healthData.sleep_hours >= 6.0 && healthData.sleep_hours < 7.0) {
//         factors.sleep_factor = 0.98;
//     } else if (healthData.sleep_hours > 9.0 && healthData.sleep_hours <= 10.0) {
//         factors.sleep_factor = 0.98;
//     } else {
//         factors.sleep_factor = 0.95;
//     }
    
//     // Chronic conditions factor
//     factors.chronic_conditions_factor = healthData.chronic_conditions.length === 0 ? 
//         1.0 : 1.0 - (healthData.chronic_conditions.length * 0.05);
    
//     return factors;
// }

// // Generate risk factors
// function generateRiskFactors(healthData) {
//     const riskFactors = [];
    
//     if (healthData.bmi >= 30.0) riskFactors.push('High BMI');
//     if (healthData.activity_level === 'sedentary') riskFactors.push('Low physical activity');
//     if (healthData.diet_quality === 'poor') riskFactors.push('Poor diet quality');
//     if (healthData.smoking_status === 'current') riskFactors.push('Current smoker');
//     if (healthData.alcohol_consumption === 'heavy') riskFactors.push('Heavy alcohol consumption');
//     if (healthData.family_history.length > 0) riskFactors.push('Family history of health conditions');
//     if (healthData.stress_level === 'high') riskFactors.push('High stress levels');
//     if (healthData.sleep_hours < 7.0 || healthData.sleep_hours > 9.0) riskFactors.push('Suboptimal sleep duration');
//     if (healthData.chronic_conditions.length > 0) riskFactors.push('Chronic health conditions');
    
//     return riskFactors;
// }

// // Generate recommendations
// function generateRecommendations(healthData) {
//     const recommendations = [];
    
//     if (healthData.bmi >= 30.0) {
//         recommendations.push('Consider working with a nutritionist to develop a healthy weight loss plan');
//     }
//     if (healthData.activity_level === 'sedentary') {
//         recommendations.push('Aim for at least 150 minutes of moderate exercise per week');
//     }
//     if (healthData.diet_quality === 'poor') {
//         recommendations.push('Focus on a balanced diet with plenty of fruits, vegetables, and whole grains');
//     }
//     if (healthData.smoking_status === 'current') {
//         recommendations.push('Consider smoking cessation programs and consult with healthcare providers');
//     }
//     if (healthData.alcohol_consumption === 'heavy') {
//         recommendations.push('Consider reducing alcohol intake and seeking support if needed');
//     }
//     if (healthData.family_history.length > 0) {
//         recommendations.push('Regular health screenings and consultations with healthcare providers');
//     }
//     if (healthData.stress_level === 'high') {
//         recommendations.push('Consider stress management techniques like meditation, exercise, or therapy');
//     }
//     if (healthData.sleep_hours < 7.0 || healthData.sleep_hours > 9.0) {
//         recommendations.push('Aim for 7-9 hours of quality sleep per night');
//     }
//     if (healthData.chronic_conditions.length > 0) {
//         recommendations.push('Regular medical check-ups and adherence to treatment plans');
//     }
    
//     // Add general recommendations
//     recommendations.push('Regular health check-ups and preventive care');
//     recommendations.push('Maintain social connections and mental health');
    
//     return recommendations;
// }

// // Generate local prompt for display
// function generateLocalPrompt(healthData) {
//     let prompt = `I am a ${healthData.age} year old ${healthData.gender}. `;
//     prompt += `I am ${healthData.height_cm} cm tall and weigh ${healthData.weight_kg} kg (BMI: ${healthData.bmi.toFixed(1)}). `;
//     prompt += `My activity level is ${healthData.activity_level} and my diet quality is ${healthData.diet_quality}. `;
    
//     // Add smoking status
//     switch(healthData.smoking_status) {
//         case 'never':
//             prompt += "I have never smoked. ";
//             break;
//         case 'former':
//             prompt += "I used to smoke but have quit. ";
//             break;
//         case 'current':
//             prompt += "I currently smoke. ";
//             break;
//         default:
//             prompt += "I have a smoking history. ";
//     }
    
//     // Add alcohol consumption
//     switch(healthData.alcohol_consumption) {
//         case 'none':
//             prompt += "I don't drink alcohol. ";
//             break;
//         case 'light':
//             prompt += "I drink alcohol occasionally (1-2 drinks per week). ";
//             break;
//         case 'moderate':
//             prompt += "I drink alcohol moderately (3-7 drinks per week). ";
//             break;
//         case 'heavy':
//             prompt += "I drink alcohol heavily (8+ drinks per week). ";
//             break;
//         default:
//             prompt += "I have moderate alcohol consumption. ";
//     }
    
//     prompt += `My stress level is ${healthData.stress_level}. `;
//     prompt += `I sleep ${healthData.sleep_hours} hours per night. `;
    
//     if (healthData.family_history.length > 0) {
//         prompt += `My family has a history of: ${healthData.family_history.join(', ')}. `;
//     } else {
//         prompt += "I have no significant family history of health conditions. ";
//     }
    
//     if (healthData.chronic_conditions.length > 0) {
//         prompt += `I have the following chronic conditions: ${healthData.chronic_conditions.join(', ')}. `;
//     } else {
//         prompt += "I have no chronic health conditions. ";
//     }
    
//     prompt += "Based on this information, how old do you think I will live until? Please provide a specific age and briefly explain your reasoning based on the health factors I mentioned.";
    
//     return prompt;
// }

// // Display results
// function displayResults(prediction) {
//     const resultsContainer = document.getElementById('results');
//     const formContainer = document.querySelector('.form-container');
    
//     // Hide form and show results
//     formContainer.style.display = 'none';
//     resultsContainer.style.display = 'block';
    
//     // Update prediction display
//     document.getElementById('predictedYears').textContent = 
//         Math.round(prediction.prediction.predicted_years);
    
//     const confidence = prediction.prediction.confidence_interval;
//     document.getElementById('confidenceRange').textContent = 
//         `${Math.round(confidence[0])} - ${Math.round(confidence[1])} years`;
    
//     // Display AI prompt and response
//     const aiPromptBox = document.getElementById('aiPrompt');
//     const aiResponseBox = document.getElementById('aiResponse');
    
//     if (prediction.prediction.ai_prompt) {
//         aiPromptBox.textContent = prediction.prediction.ai_prompt;
//     } else {
//         aiPromptBox.textContent = 'No AI prompt generated';
//     }
    
//     if (prediction.prediction.ai_response) {
//         aiResponseBox.textContent = prediction.prediction.ai_response;
//     } else {
//         aiResponseBox.textContent = 'No AI response available';
//     }
    
//     // Display risk factors
//     const riskFactorsList = document.getElementById('riskFactors');
//     riskFactorsList.innerHTML = '';
//     prediction.prediction.risk_factors.forEach(factor => {
//         const li = document.createElement('li');
//         li.textContent = factor;
//         riskFactorsList.appendChild(li);
//     });
    
//     // Display recommendations
//     const recommendationsList = document.getElementById('recommendations');
//     recommendationsList.innerHTML = '';
//     prediction.prediction.recommendations.forEach(rec => {
//         const li = document.createElement('li');
//         li.textContent = rec;
//         recommendationsList.appendChild(li);
//     });
    
//     // Display factors breakdown
//     const factorsBreakdown = document.getElementById('factorsBreakdown');
//     factorsBreakdown.innerHTML = '';
    
//     Object.entries(prediction.prediction.factors_breakdown).forEach(([factor, value]) => {
//         const factorDiv = document.createElement('div');
//         factorDiv.className = 'factor-item';
//         factorDiv.innerHTML = `
//             <div class="factor-name">${formatFactorName(factor)}</div>
//             <div class="factor-value">${(value * 100).toFixed(0)}%</div>
//         `;
//         factorsBreakdown.appendChild(factorDiv);
//     });
    
//     // Load health tips
//     loadHealthTips();
    
//     // Scroll to results
//     resultsContainer.scrollIntoView({ behavior: 'smooth' });
// }

// // Format factor names for display
// function formatFactorName(factor) {
//     return factor
//         .replace(/_/g, ' ')
//         .split(' ')
//         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(' ');
// }

// // Load health tips
// async function loadHealthTips() {
//     try {
//         let tips = [];
        
//         if (agent && canisterId) {
//             // Get tips from IC
//             const response = await agent.call(canisterId, 'get_health_tips', []);
//             tips = response;
//         } else {
//             // Local tips
//             tips = [
//                 'Exercise regularly - aim for 150 minutes of moderate activity per week',
//                 'Eat a balanced diet rich in fruits, vegetables, and whole grains',
//                 'Maintain a healthy weight through diet and exercise',
//                 'Avoid smoking and limit alcohol consumption',
//                 'Get 7-9 hours of quality sleep each night',
//                 'Manage stress through meditation, exercise, or therapy',
//                 'Stay up to date with preventive health screenings',
//                 'Maintain strong social connections and mental health',
//                 'Stay hydrated and limit processed foods',
//                 'Consider working with healthcare providers for personalized advice'
//             ];
//         }
        
//         const tipsList = document.getElementById('healthTips');
//         tipsList.innerHTML = '';
//         tips.forEach(tip => {
//             const li = document.createElement('li');
//             li.textContent = tip;
//             tipsList.appendChild(li);
//         });
//     } catch (error) {
//         console.error('Failed to load health tips:', error);
//     }
// }

// // Show/hide loading
// function showLoading(show) {
//     const loading = document.getElementById('loading');
//     const formContainer = document.querySelector('.form-container');
//     const resultsContainer = document.getElementById('results');
    
//     if (show) {
//         formContainer.style.display = 'none';
//         resultsContainer.style.display = 'none';
//         loading.style.display = 'block';
//     } else {
//         loading.style.display = 'none';
//     }
// }

// // Reset form
// function resetForm() {
//     document.getElementById('healthForm').reset();
//     document.querySelector('.form-container').style.display = 'block';
//     document.getElementById('results').style.display = 'none';
//     document.getElementById('loading').style.display = 'none';
// }

// // Show notification
// function showNotification(message, type = 'info') {
//     // Create notification element
//     const notification = document.createElement('div');
//     notification.className = `notification notification-${type}`;
//     notification.textContent = message;
    
//     // Style the notification
//     notification.style.cssText = `
//         position: fixed;
//         top: 20px;
//         right: 20px;
//         padding: 1rem 1.5rem;
//         border-radius: 8px;
//         color: white;
//         font-weight: 500;
//         z-index: 1000;
//         animation: slideIn 0.3s ease;
//         max-width: 300px;
//     `;
    
//     // Set background color based on type
//     if (type === 'error') {
//         notification.style.backgroundColor = '#e53e3e';
//     } else if (type === 'success') {
//         notification.style.backgroundColor = '#38a169';
//     } else {
//         notification.style.backgroundColor = '#4299e1';
//     }
    
//     // Add to page
//     document.body.appendChild(notification);
    
//     // Remove after 5 seconds
//     setTimeout(() => {
//         notification.style.animation = 'slideOut 0.3s ease';
//         setTimeout(() => {
//             if (notification.parentNode) {
//                 notification.parentNode.removeChild(notification);
//             }
//         }, 300);
//     }, 5000);
// }

// // Add CSS animations for notifications
// const style = document.createElement('style');
// style.textContent = `
//     @keyframes slideIn {
//         from { transform: translateX(100%); opacity: 0; }
//         to { transform: translateX(0); opacity: 1; }
//     }
//     @keyframes slideOut {
//         from { transform: translateX(0); opacity: 1; }
//         to { transform: translateX(100%); opacity: 0; }
//     }
// `;
// document.head.appendChild(style); 