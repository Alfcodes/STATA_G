// Question templates for each game mode

/**
 * Each template contains:
 * - id: unique string
 * - title: mission title
 * - type: 'code' or 'mcq'
 * - generate: function() -> { mission, dataInject, answer?, choices?, correctIndex? }
 *
 * For code missions, the generate() should return an object with:
 * { mission: string, dataInject: function(dataset) -> void, check: function(commands, dataset) -> boolean }
 *
 * For MCQ missions, generate() returns:
 * { mission: string, choices: string[], correctIndex: number }
 */

export const continuousTemplates = [
  {
    id: 'cont1',
    title: 'Summarize BMI',
    type: 'code',
    generate() {
      return {
        mission: 'Compute summary statistics for the BMI variable using the summarize command with the detail option.',
        dataInject(dataset) {
          // dataset has bmi; nothing else needed
        },
        check(commands) {
          // Accept summarize bmi, detail (with or without comma spacing)
          return commands.some((cmd) => /summarize\s+bmi\s*,?\s*detail/.test(cmd.toLowerCase()));
        }
      };
    }
  },
  {
    id: 'cont2',
    title: 'Box Plot of Length of Stay',
    type: 'code',
    generate() {
      return {
        mission: 'Create a box plot for the length of stay (los) variable.',
        dataInject(dataset) {
          // dataset has los; nothing to inject
        },
        check(commands) {
          return commands.some((cmd) => /graph\s+box\s+los/.test(cmd.toLowerCase()));
        }
      };
    }
  }
];

export const binaryTemplates = [
  {
    id: 'bin1',
    title: 'Logistic Regression for Mortality',
    type: 'code',
    generate() {
      return {
        mission: 'Fit a logistic regression model for the outcome mortality (mortality) using age and sex as predictors. Display odds ratios.',
        dataInject(dataset) {
          // dataset has mortality, age, sex
        },
        check(commands) {
          // Accept logistic or logit with mortality age i.sex and option or
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return (
              (/^(logistic|logit)/.test(c) && /mortality/.test(c) && /age/.test(c) && /sex/.test(c)) ||
              (/^(logistic|logit)/.test(c) && /i\.sex/.test(c))
            );
          });
        }
      };
    }
  }
];

export const countTemplates = [
  {
    id: 'cnt1',
    title: 'Poisson Regression for Visits',
    type: 'code',
    generate() {
      return {
        mission: 'Fit a Poisson regression model for the number of visits in 12 months (visits_12mo) using age and sex as predictors.',
        dataInject(dataset) {
          // dataset has visits_12mo, age, sex
        },
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /poisson/.test(c) && /visits_12mo/.test(c) && /age/.test(c) && /sex/.test(c);
          });
        }
      };
    }
  }
];

export const cleaningTemplates = [
  {
    id: 'clean1',
    title: 'Drop Missing Age/BMI',
    type: 'code',
    generate() {
      return {
        mission: 'There are missing values in variables age and bmi. Drop observations that have missing age or missing bmi.',
        dataInject(dataset) {
          // Introduce some missingness for demonstration
          const n = dataset.length;
          for (let i = 0; i < n; i++) {
            if (Math.random() < 0.05) dataset[i].age = null;
            if (Math.random() < 0.05) dataset[i].bmi = null;
          }
        },
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /drop\s+if\s+.*missing\(age\).*\|.*missing\(bmi\)/.test(c);
          });
        }
      };
    }
  },
  {
    id: 'clean2',
    title: 'Report Missing Values',
    type: 'code',
    generate() {
      return {
        mission: 'Count how many observations have missing values for age or bmi.',
        dataInject(dataset) {
          // Introduce missingness
          const n = dataset.length;
          for (let i = 0; i < n; i++) {
            if (Math.random() < 0.05) dataset[i].age = null;
            if (Math.random() < 0.05) dataset[i].bmi = null;
          }
        },
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /count\s+if\s+.*missing\(age\).*\|.*missing\(bmi\)/.test(c);
          });
        }
      };
    }
  },
  {
    id: 'clean3',
    title: 'Identify Duplicates',
    type: 'code',
    generate() {
      return {
        mission: 'Identify duplicate patient IDs in the dataset.',
        dataInject(dataset) {
          // Introduce duplicate id for demonstration
          if (dataset.length > 5) {
            dataset[dataset.length - 1].patient_id = dataset[0].patient_id;
          }
        },
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /duplicates\s+report\s+patient_id/.test(c);
          });
        }
      };
    }
  }
];

export const assumptionsTemplates = [
  {
    id: 'assump1',
    title: 'Normality Check',
    type: 'mcq',
    generate() {
      return {
        mission: 'Which Stata command is used to produce a Q-Q plot of residuals to check normality after a regression?',
        choices: ['qnorm', 'rvfplot', 'hettest', 'vif'],
        correctIndex: 0
      };
    }
  },
  {
    id: 'assump2',
    title: 'Heteroscedasticity Test',
    type: 'mcq',
    generate() {
      return {
        mission: 'After fitting a linear regression, which command tests for heteroscedasticity?',
        choices: ['swilk', 'hettest', 'estat gof', 'linktest'],
        correctIndex: 1
      };
    }
  },
  {
    id: 'assump3',
    title: 'Overdispersion in Counts',
    type: 'mcq',
    generate() {
      return {
        mission: 'If a Poisson model for count data shows overdispersion, which alternative model is recommended?',
        choices: ['regress', 'logit', 'nbreg', 'poisson'],
        correctIndex: 2
      };
    }
  }
];