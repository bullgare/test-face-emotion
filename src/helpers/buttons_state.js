const selectorPrefix = 'js-btn-';
/**
 * css class for guessed emotion
 * @type {string}
 */
const classCurrentEmotion = 'btn-danger';
/**
 * css class for emotion to guess (turned on)
 * @type {string}
 */
const classSelectedEmotion = 'btn-info';
/**
 * css class for turned off emotion
 * @type {string}
 */
const classUnselectedEmotion = 'btn-outline-info';

export default class ButtonsState {
  constructor(initialState, inactiveEmotions = [], cbOnClick) {
    this.cbOnClick = cbOnClick;
    this.buttons = [];
    for (let s of initialState) {
      const btn = this._getBtn(s.emotion);
      if (btn) {
        this.buttons.push(btn);

        if (inactiveEmotions.includes(btn.emotion)) {
          btn.active = false;
        }

        this.constructor._setClass(btn);
      }
    }
  }

  update(emotion) {
    this.buttons.forEach(item => {
      if (item.emotion === emotion) {
        item.current = true;
        this.constructor._setClass(item);
      } else if (item.current) {
        item.current = false;
        this.constructor._setClass(item);
      }
    });
  }

  _getBtn(emotion) {
    const el = document.getElementById(`${selectorPrefix}${emotion}`);
    if (!el) {
      return null;
    }

    const staticClasses = el.className.replace(/\bbtn-.+\b/, '').trim();

    const item = {
      el,
      emotion,
      active: true,
      staticClasses,
      current: false,
      classes: el.className.replace(staticClasses, '').trim().split(' ')
    };

    el.addEventListener('click', () => this._clickItem(item));

    return item;
  }

  static _setClass(item) {
    let additionalClass = classSelectedEmotion;
    if (item.current) {
      additionalClass = classCurrentEmotion;
    } else if (!item.active) {
      additionalClass = classUnselectedEmotion;
    }
    item.el.className = item.staticClasses + ' ' + additionalClass;
  }

  _clickItem(item) {
    item.active = !item.active;
    this.constructor._setClass(item);
    if (typeof this.cbOnClick === 'function') {
      const emotionsToRemove = this.buttons.reduce((emotions, button) => {
        if (!button.active) {
          emotions.push(button.emotion);
        }
        return emotions;
      }, []);
      this.cbOnClick(item.emotion, item.active, emotionsToRemove);
    }
  }
}