class EmotionClassifier {
  constructor() {
    this.previousParameters = [];
    this.classifier = {};
    this.emotions = [];
    this.coefficientLength = 0;
  }

  getEmotions() {
    return this.emotions;
  };

  init(model) {
    // load it
    for (let m in model) {
      this.emotions.push(m);
      this.classifier[m] = {};
      this.classifier[m]['bias'] = model[m]['bias'];
      this.classifier[m]['coefficients'] = model[m]['coefficients'];
    }
    this.coefficientLength = this.classifier[this.emotions[0]]['coefficients'].length;
  };

  getBlank() {
    const prediction = [];
    for (let j = 0;j < this.emotions.length;j++) {
      prediction[j] = {"emotion" : this.emotions[j], "value" : 0.0};
    }
    return prediction;
  };

  predict(parameters) {
    const prediction = [];
    for (let j = 0;j < this.emotions.length;j++) {
      let e = this.emotions[j];
      let score = this.classifier[e].bias;
      for (let i = 0; i < this.coefficientLength; i++) {
        score += this.classifier[e].coefficients[i]*parameters[i+6];
      }
      prediction[j] = {"emotion" : e, "value" : 0.0};
      prediction[j]['value'] = 1.0/(1.0 + Math.exp(-score));
    }
    return prediction;
  };

  meanPredict(parameters) {
    // store to array of 10 previous parameters
    this.previousParameters.splice(0, this.previousParameters.length === 10 ? 1 : 0);
    this.previousParameters.push(parameters.slice(0));

    if (this.previousParameters.length > 9) {
      // calculate mean of parameters?
      const meanParameters = [];
      for (let i = 0;i < parameters.length;i++) {
        meanParameters[i] = 0;
      }
      for (let i = 0;i < this.previousParameters.length;i++) {
        for (let j = 0;j < parameters.length;j++) {
          meanParameters[j] += this.previousParameters[i][j];
        }
      }
      for (let i = 0;i < parameters.length;i++) {
        meanParameters[i] /= 10;
      }

      // calculate logistic regression
      return this.predict(meanParameters);
    } else {
      return false;
    }
  }
}

export default EmotionClassifier;