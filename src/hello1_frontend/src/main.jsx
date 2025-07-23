import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';

const HealthPredictionApp = () => {
  // State management
  const [agent, setAgent] = useState(null);
  const [canisterId, setCanisterId] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activity: '',
    diet: '',
    smoking: '',
    alcohol: '',
    family_history: [],
    stress: '',
    sleep: '',
    chronic_conditions: []
  });
  const [bmi, setBmi] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  // Initialize the Internet Computer agent
  // useEffect(() => {
  //   const initializeApp = async () => {
  //     try {
  //       if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  //         const { HttpAgent } = await import('https://cdn.jsdelivr.net/npm/@dfinity/agent@0.15.0/dist/cjs/index.js');
  //         const newAgent = new HttpAgent({ host: 'https://ic0.app' });
  //         await newAgent.fetchRootKey();
          
  //         setAgent(newAgent);
  //         setCanisterId(window.location.hostname.split('.')[0]);
  //       } else {
  //         const { HttpAgent } = await import('https://cdn.jsdelivr.net/npm/@dfinity/agent@0.15.0/dist/cjs/index.js');
  //         const newAgent = new HttpAgent({ host: 'http://localhost:4943' });
  //         await newAgent.fetchRootKey();
          
  //         setAgent(newAgent);
  //         setCanisterId('rrkah-fqaaa-aaaaa-aaaaq-cai');
  //       }
        
  //       console.log('Internet Computer agent initialized');
  //     } catch (error) {
  //       console.error('Failed to initialize IC agent:', error);
  //       showNotification('Using local calculation mode', 'info');
  //     }
  //   };

  //   initializeApp();
  // }, []);

  // Calculate BMI when height or weight changes
  useEffect(() => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    
    if (height > 0 && weight > 0) {
      const calculatedBmi = weight / Math.pow(height / 100, 2);
      setBmi(calculatedBmi);
      console.log('Calculated BMI:', calculatedBmi.toFixed(1));
    }
  }, [formData.height, formData.weight]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  // Collect and validate form data
  const collectFormData = () => {
    const healthData = {
      age: parseInt(formData.age),
      gender: formData.gender,
      height_cm: parseFloat(formData.height),
      weight_kg: parseFloat(formData.weight),
      bmi: bmi,
      activity_level: formData.activity,
      diet_quality: formData.diet,
      smoking_status: formData.smoking,
      alcohol_consumption: formData.alcohol,
      family_history: formData.family_history,
      stress_level: formData.stress,
      sleep_hours: parseFloat(formData.sleep),
      chronic_conditions: formData.chronic_conditions
    };
    
    return healthData;
  };

  // Validate form data
  const validateFormData = (data) => {
    const requiredFields = ['age', 'gender', 'height_cm', 'weight_kg', 'activity_level', 
                          'diet_quality', 'smoking_status', 'alcohol_consumption', 'stress_level', 'sleep_hours'];
    
    for (const field of requiredFields) {
      if (!data[field] || data[field] === '') {
        return false;
      }
    }
    return true;
  };

  // Get life expectancy prediction
  const getLifeExpectancyPrediction = async (healthData) => {
    return await getICPrediction(healthData);
  };

  // Get prediction from Internet Computer or local calculation
  const getICPrediction = async (healthData) => {
    try {
      const request = {
        health_data: healthData,
        user_id: null
      };
      
      if (typeof window !== 'undefined' && window.backend) {
        const response = await window.backend.chat([request]);
        return response;
      } else {
        return await getLocalPrediction(healthData);
      }
    } catch (error) {
      console.error('IC prediction error:', error);
      return await getLocalPrediction(healthData);
    }
  };

  // Local prediction calculation (fallback)
  const getLocalPrediction = async (healthData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let baseLifeExpectancy = 78.8;
    const factors = calculateLocalFactors(healthData);
    const totalFactor = Object.values(factors).reduce((a, b) => a * b, 1);
    
    const predictedYears = baseLifeExpectancy * totalFactor;
    const confidenceInterval = [predictedYears * 0.9, predictedYears * 1.1];
    
    const riskFactors = generateRiskFactors(healthData);
    const recommendations = generateRecommendations(healthData);
    
    return {
      prediction: {
        predicted_years: predictedYears,
        confidence_interval: confidenceInterval,
        risk_factors: riskFactors,
        recommendations: recommendations,
        factors_breakdown: factors,
        ai_prompt: generateLocalPrompt(healthData),
        ai_response: "Meta AI analysis using Llama model - local calculation mode"
      },
      timestamp: Date.now(),
      request_id: 'local_' + Date.now()
    };
  };

  // Calculate local factors
  const calculateLocalFactors = (healthData) => {
    const factors = {};
    
    factors.age_factor = healthData.age < 30 ? 1.0 : healthData.age < 50 ? 0.95 : 0.9;
    
    if (healthData.bmi < 18.5) factors.bmi_factor = 0.95;
    else if (healthData.bmi < 25.0) factors.bmi_factor = 1.0;
    else if (healthData.bmi < 30.0) factors.bmi_factor = 0.98;
    else if (healthData.bmi < 35.0) factors.bmi_factor = 0.95;
    else factors.bmi_factor = 0.90;
    
    const activityFactors = {
      'sedentary': 0.85, 'light': 0.92, 'moderate': 0.98, 'active': 1.02, 'very_active': 1.05
    };
    factors.activity_factor = activityFactors[healthData.activity_level] || 0.90;
    
    const dietFactors = {
      'poor': 0.85, 'fair': 0.92, 'good': 0.98, 'excellent': 1.03
    };
    factors.diet_factor = dietFactors[healthData.diet_quality] || 0.90;
    
    const smokingFactors = {
      'never': 1.0, 'former': 0.98, 'current': 0.85
    };
    factors.smoking_factor = smokingFactors[healthData.smoking_status] || 0.95;
    
    const alcoholFactors = {
      'none': 1.0, 'light': 0.98, 'moderate': 0.95, 'heavy': 0.85
    };
    factors.alcohol_factor = alcoholFactors[healthData.alcohol_consumption] || 0.95;
    
    factors.family_history_factor = healthData.family_history.length === 0 ? 
      1.0 : 1.0 - (healthData.family_history.length * 0.02);
    
    const stressFactors = {
      'low': 1.02, 'medium': 0.98, 'high': 0.92
    };
    factors.stress_factor = stressFactors[healthData.stress_level] || 0.95;
    
    if (healthData.sleep_hours >= 7.0 && healthData.sleep_hours <= 9.0) {
      factors.sleep_factor = 1.0;
    } else if (healthData.sleep_hours >= 6.0 && healthData.sleep_hours < 7.0) {
      factors.sleep_factor = 0.98;
    } else if (healthData.sleep_hours > 9.0 && healthData.sleep_hours <= 10.0) {
      factors.sleep_factor = 0.98;
    } else {
      factors.sleep_factor = 0.95;
    }
    
    factors.chronic_conditions_factor = healthData.chronic_conditions.length === 0 ? 
      1.0 : 1.0 - (healthData.chronic_conditions.length * 0.05);
    
    return factors;
  };

  // Generate risk factors
  const generateRiskFactors = (healthData) => {
    const riskFactors = [];
    
    if (healthData.bmi >= 30.0) riskFactors.push('High BMI');
    if (healthData.activity_level === 'sedentary') riskFactors.push('Low physical activity');
    if (healthData.diet_quality === 'poor') riskFactors.push('Poor diet quality');
    if (healthData.smoking_status === 'current') riskFactors.push('Current smoker');
    if (healthData.alcohol_consumption === 'heavy') riskFactors.push('Heavy alcohol consumption');
    if (healthData.family_history.length > 0) riskFactors.push('Family history of health conditions');
    if (healthData.stress_level === 'high') riskFactors.push('High stress levels');
    if (healthData.sleep_hours < 7.0 || healthData.sleep_hours > 9.0) riskFactors.push('Suboptimal sleep duration');
    if (healthData.chronic_conditions.length > 0) riskFactors.push('Chronic health conditions');
    
    return riskFactors;
  };

  // Generate recommendations
  const generateRecommendations = (healthData) => {
    const recommendations = [];
    
    if (healthData.bmi >= 30.0) {
      recommendations.push('Consider working with a nutritionist to develop a healthy weight loss plan');
    }
    if (healthData.activity_level === 'sedentary') {
      recommendations.push('Aim for at least 150 minutes of moderate exercise per week');
    }
    if (healthData.diet_quality === 'poor') {
      recommendations.push('Focus on a balanced diet with plenty of fruits, vegetables, and whole grains');
    }
    if (healthData.smoking_status === 'current') {
      recommendations.push('Consider smoking cessation programs and consult with healthcare providers');
    }
    if (healthData.alcohol_consumption === 'heavy') {
      recommendations.push('Consider reducing alcohol intake and seeking support if needed');
    }
    if (healthData.family_history.length > 0) {
      recommendations.push('Regular health screenings and consultations with healthcare providers');
    }
    if (healthData.stress_level === 'high') {
      recommendations.push('Consider stress management techniques like meditation, exercise, or therapy');
    }
    if (healthData.sleep_hours < 7.0 || healthData.sleep_hours > 9.0) {
      recommendations.push('Aim for 7-9 hours of quality sleep per night');
    }
    if (healthData.chronic_conditions.length > 0) {
      recommendations.push('Regular medical check-ups and adherence to treatment plans');
    }
    
    recommendations.push('Regular health check-ups and preventive care');
    recommendations.push('Maintain social connections and mental health');
    
    return recommendations;
  };

  // Generate local prompt for display
  const generateLocalPrompt = (healthData) => {
    let prompt = `I am a ${healthData.age} year old ${healthData.gender}. `;
    prompt += `I am ${healthData.height_cm} cm tall and weigh ${healthData.weight_kg} kg (BMI: ${healthData.bmi.toFixed(1)}). `;
    prompt += `My activity level is ${healthData.activity_level} and my diet quality is ${healthData.diet_quality}. `;
    
    switch(healthData.smoking_status) {
      case 'never':
        prompt += "I have never smoked. ";
        break;
      case 'former':
        prompt += "I used to smoke but have quit. ";
        break;
      case 'current':
        prompt += "I currently smoke. ";
        break;
      default:
        prompt += "I have a smoking history. ";
    }
    
    switch(healthData.alcohol_consumption) {
      case 'none':
        prompt += "I don't drink alcohol. ";
        break;
      case 'light':
        prompt += "I drink alcohol occasionally (1-2 drinks per week). ";
        break;
      case 'moderate':
        prompt += "I drink alcohol moderately (3-7 drinks per week). ";
        break;
      case 'heavy':
        prompt += "I drink alcohol heavily (8+ drinks per week). ";
        break;
      default:
        prompt += "I have moderate alcohol consumption. ";
    }
    
    prompt += `My stress level is ${healthData.stress_level}. `;
    prompt += `I sleep ${healthData.sleep_hours} hours per night. `;
    
    if (healthData.family_history.length > 0) {
      prompt += `My family has a history of: ${healthData.family_history.join(', ')}. `;
    } else {
      prompt += "I have no significant family history of health conditions. ";
    }
    
    if (healthData.chronic_conditions.length > 0) {
      prompt += `I have the following chronic conditions: ${healthData.chronic_conditions.join(', ')}. `;
    } else {
      prompt += "I have no chronic health conditions. ";
    }
    
    prompt += "Based on this information, how old do you think I will live until? Please provide a specific age and briefly explain your reasoning based on the health factors I mentioned.";
    
    return prompt;
  };

  // Format factor names for display
  const formatFactorName = (factor) => {
    return factor
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    
    const healthData = collectFormData();
    
    if (!validateFormData(healthData)) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const prediction = await getLifeExpectancyPrediction(healthData);
      setResults(prediction);
      setLoading(false);
    } catch (error) {
      console.error('Prediction error:', error);
      showNotification('Failed to get prediction. Please try again.', 'error');
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      age: '', gender: '', height: '', weight: '', activity: '', diet: '',
      smoking: '', alcohol: '', family_history: [], stress: '', sleep: '',
      chronic_conditions: []
    });
    setBmi(0);
    setResults(null);
    setLoading(false);
  };

  // Health tips
  const healthTips = [
    'Exercise regularly - aim for 150 minutes of moderate activity per week',
    'Eat a balanced diet rich in fruits, vegetables, and whole grains',
    'Maintain a healthy weight through diet and exercise',
    'Avoid smoking and limit alcohol consumption',
    'Get 7-9 hours of quality sleep each night',
    'Manage stress through meditation, exercise, or therapy',
    'Stay up to date with preventive health screenings',
    'Maintain strong social connections and mental health',
    'Stay hydrated and limit processed foods',
    'Consider working with healthcare providers for personalized advice'
  ];

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
