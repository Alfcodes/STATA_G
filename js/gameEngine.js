// Game engine for Stata Command Quest
// Handles dataset generation, mission selection and answer checking

import {
  continuousTemplates,
  binaryTemplates,
  countTemplates,
  cleaningTemplates,
  assumptionsTemplates
} from './templates.js';

// Helper: generate random normal using Box-Muller
function rnorm(mean = 0, sd = 1) {
  let u1 = 0,
    u2 = 0;
  //Convert [0,1) to (0,1)
  u1 = Math.random();
  u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * sd + mean;
}

// Generate synthetic patient dataset
export function generateDataset(n = 120) {
  const dataset = [];
  for (let i = 0; i < n; i++) {
    const id = i + 1;
    // Age 18-70, approximate normal around 35 with sd 10
    let age = Math.round(rnorm(35, 10));
    age = Math.max(18, Math.min(70, age));
    // Sex 0/1
    const sex = Math.random() < 0.5 ? 0 : 1;
    // BMI around 26 with sd 4
    let bmi = rnorm(26, 4);
    bmi = Math.round(bmi * 10) / 10;
    // Smoker 1 with prob 0.2
    const smoker = Math.random() < 0.2 ? 1 : 0;
    // Visits Poisson mean 4
    const visits = Math.max(0, Math.round(rnorm(4, 2)));
    // Mortality binary with prob 0.05
    const mortality = Math.random() < 0.05 ? 1 : 0;
    // Length of stay (los) continuous: gamma-like (we approximate with normal but positive)
    let los = rnorm(5, 2);
    if (los < 0) los = Math.abs(los);
    los = Math.round(los * 10) / 10;
    // Region 1-4
    const region = Math.floor(Math.random() * 4) + 1;
    dataset.push({ patient_id: id, age, sex, bmi, smoker, visits_12mo: visits, mortality, los, region });
  }
  return dataset;
}

export default class GameEngine {
  constructor(mode) {
    this.mode = mode;
    this.dataset = generateDataset();
    this.score = 0;
    this.currentMission = null;
    this.templates = this.getTemplatesForMode(mode);
  }

  // Get templates array based on mode
  getTemplatesForMode(mode) {
    switch (mode) {
      case 'continuous':
        return continuousTemplates;
      case 'binary':
        return binaryTemplates;
      case 'count':
        return countTemplates;
      case 'cleaning':
        return cleaningTemplates;
      case 'assumptions':
        return assumptionsTemplates;
      default:
        return [];
    }
  }

  // Select next mission randomly
  nextMission() {
    if (this.templates.length === 0) return null;
    // pick a random template
    const template = this.templates[Math.floor(Math.random() * this.templates.length)];
    const missionSpec = template.generate();
    // Copy dataset for mission to avoid cross-mission contamination
    const datasetCopy = JSON.parse(JSON.stringify(this.dataset));
    // Inject modifications if provided
    if (missionSpec.dataInject) missionSpec.dataInject(datasetCopy);
    this.currentMission = {
      templateId: template.id,
      type: template.type,
      missionText: missionSpec.mission,
      checkFn: missionSpec.check,
      choices: missionSpec.choices || null,
      correctIndex: missionSpec.correctIndex || null,
      dataset: datasetCopy
    };
    return this.currentMission;
  }

  // Evaluate answer: commands is array of strings for code missions; answer is index for MCQ
  checkAnswer(userInput) {
    if (!this.currentMission) return false;
    if (this.currentMission.type === 'code') {
      const commands = userInput
        .split(/\n|;|\r/) // split by newline or semicolon
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      const result = this.currentMission.checkFn(commands);
      if (result) this.score += 1;
      return result;
    } else if (this.currentMission.type === 'mcq') {
      const selectedIndex = parseInt(userInput, 10);
      const correct = selectedIndex === this.currentMission.correctIndex;
      if (correct) this.score += 1;
      return correct;
    }
    return false;
  }

  getScore() {
    return this.score;
  }
}