/* ************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
const cssSelectorBuilder = {
  order: ['type', 'id', 'class', 'attr', 'pclass', 'pelement'],
  currentOrder: 0,

  element(value) {
    if (this.bType) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    if (this.currentOrder > this.order.indexOf('type')) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    const builder = Object.assign(Object.create(cssSelectorBuilder), this);
    builder.bType = value;
    builder.currentOrder = this.order.indexOf('type');
    return builder;
  },

  id(value) {
    if (this.bId) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    if (this.currentOrder > this.order.indexOf('id')) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    const builder = Object.assign(Object.create(cssSelectorBuilder), this);
    builder.bId = `#${value}`;
    builder.currentOrder = this.order.indexOf('id');
    return builder;
  },

  class(value) {
    if (this.currentOrder > this.order.indexOf('class')) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    const builder = Object.assign(Object.create(cssSelectorBuilder), this);
    if (builder.bClass) {
      builder.bClass += `.${value}`;
    } else {
      builder.bClass = `.${value}`;
    }
    builder.currentOrder = this.order.indexOf('class');
    return builder;
  },

  attr(value) {
    if (this.currentOrder > this.order.indexOf('attr')) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    const builder = Object.assign(Object.create(cssSelectorBuilder), this);
    if (builder.bAttr) {
      builder.bAttr += `[${value}]`;
    } else {
      builder.bAttr = `[${value}]`;
    }
    builder.currentOrder = this.order.indexOf('attr');
    return builder;
  },

  pseudoClass(value) {
    if (this.currentOrder > this.order.indexOf('pclass')) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    const builder = Object.assign(Object.create(cssSelectorBuilder), this);
    if (builder.bPseudoClass) {
      builder.bPseudoClass += `:${value}`;
    } else {
      builder.bPseudoClass = `:${value}`;
    }
    builder.currentOrder = this.order.indexOf('pclass');
    return builder;
  },

  pseudoElement(value) {
    if (this.bPseudoElem) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    const builder = Object.assign(Object.create(cssSelectorBuilder), this);
    builder.bPseudoElem = `::${value}`;
    builder.currentOrder = this.order.indexOf('pelement');
    return builder;
  },

  combine(selector1, combinator, selector2) {
    this.bCombination = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
    return this;
  },

  stringify() {
    let result = '';
    if (this.bCombination) {
      result = this.bCombination;
      this.clear();
      return result;
    }
    if (this.bType) result += this.bType;
    if (this.bId) result += this.bId;
    if (this.bClass) result += this.bClass;
    if (this.bAttr) result += this.bAttr;
    if (this.bPseudoClass) result += this.bPseudoClass;
    if (this.bPseudoElem) result += this.bPseudoElem;
    this.clear();
    return result;
  },

  clear() {
    this.bType = '';
    this.bId = '';
    this.bClass = '';
    this.bAttr = '';
    this.bPseudoClass = '';
    this.bPseudoElem = '';
    this.bCombination = '';
    this.currentOrder = 0;
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
