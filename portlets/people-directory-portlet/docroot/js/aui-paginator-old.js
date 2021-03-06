/**
 * Copyright (C) 2005-2014 Rivet Logic Corporation.
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

AUI.add('aui-paginator-old', function(A) {
/**
 * The Paginator Utility - The Paginator widget provides a set of controls to navigate through paged data.
 *
 * @module aui-paginator
 */

var L = A.Lang,
	isArray = L.isArray,
	isBoolean = L.isBoolean,
	isFunction = L.isFunction,
	isNumber = L.isNumber,
	isObject = L.isObject,
	isString = L.isString,

	toInt = L.toInt,

	ALWAYS_VISIBLE = 'alwaysVisible',
	CIRCULAR = 'circular',
	CONTAINER = 'container',
	CONTAINERS = 'containers',
	CONTENT = 'content',
	CURRENT = 'current',
	DOT = '.',
	FIRST = 'first',
	FIRST_PAGE_LINK_LABEL = 'firstPageLinkLabel',
	LAST = 'last',
	LAST_PAGE_LINK_LABEL = 'lastPageLinkLabel',
	LINK = 'link',
	MAX_PAGE_LINKS = 'maxPageLinks',
	NEXT = 'next',
	NEXT_PAGE_LINK_LABEL = 'nextPageLinkLabel',
	OPTION = 'option',
	PAGE = 'page',
	PAGE_LINK_CONTENT = 'pageLinkContent',
	PAGINATOR = 'paginator',
	PER = 'per',
	PREV = 'prev',
	PREV_PAGE_LINK_LABEL = 'prevPageLinkLabel',
	REPORT = 'report',
	ROWS = 'rows',
	ROWS_PER_PAGE = 'rowsPerPage',
	ROWS_PER_PAGE_OPTIONS = 'rowsPerPageOptions',
	SELECTED = 'selected',
	SPACE = ' ',
	STATE = 'state',
	TOTAL = 'total',
	TOTAL_LABEL = 'totalLabel',
	TOTAL_PAGES = 'totalPages',

	concat = function() {
		return Array.prototype.slice.call(arguments).join(SPACE);
	},

	isNodeList = function(value) {
		return (value instanceof A.NodeList);
	},

	getCN = A.getClassName,

	IE = A.UA.ie,

	CSS_PAGINATOR = getCN(PAGINATOR),
	CSS_PAGINATOR_CONTAINER = getCN(PAGINATOR, CONTAINER),
	CSS_PAGINATOR_CONTENT = getCN(PAGINATOR, CONTENT),
	CSS_PAGINATOR_CURRENT_PAGE = getCN(PAGINATOR, CURRENT, PAGE),
	CSS_PAGINATOR_FIRST_LINK = getCN(PAGINATOR, FIRST, LINK),
	CSS_PAGINATOR_LAST_LINK = getCN(PAGINATOR, LAST, LINK),
	CSS_PAGINATOR_LINK = getCN(PAGINATOR, LINK),
	CSS_PAGINATOR_NEXT_LINK = getCN(PAGINATOR, NEXT, LINK),
	CSS_PAGINATOR_PAGE_CONTAINER = getCN(PAGINATOR, PAGE, CONTAINER),
	CSS_PAGINATOR_PAGE_LINK = getCN(PAGINATOR, PAGE, LINK),
	CSS_PAGINATOR_PAGE_REPORT = getCN(PAGINATOR, CURRENT, PAGE, REPORT),
	CSS_PAGINATOR_PREV_LINK = getCN(PAGINATOR, PREV, LINK),
	CSS_PAGINATOR_ROWS_PER_PAGE = getCN(PAGINATOR, ROWS, PER, PAGE),
	CSS_PAGINATOR_TOTAL = getCN(PAGINATOR, TOTAL),

	DEFAULT_TPL = {
		defaultOutput: '{FirstPageLink} {PrevPageLink} {PageLinks} {NextPageLink} {LastPageLink} {CurrentPageReport} {Total} {RowsPerPageSelect}',
		firstLink: '<a href="#" class="' + concat(CSS_PAGINATOR_LINK, CSS_PAGINATOR_FIRST_LINK) + '"></a>',
		lastLink: '<a href="#" class="' + concat(CSS_PAGINATOR_LINK, CSS_PAGINATOR_LAST_LINK) + '"></a>',
		nextLink: '<a href="#" class="' + concat(CSS_PAGINATOR_LINK, CSS_PAGINATOR_NEXT_LINK) + '"></a>',
		pageContainer: '<span></span>',
		pageLink: '<a href="#"></a>',
		pageReport: '<span class="' + concat(CSS_PAGINATOR_PAGE_REPORT) + '"></span>',
		pageReportLabel: '({page} of {totalPages})',
		prevLink: '<a href="#" class="' + concat(CSS_PAGINATOR_LINK, CSS_PAGINATOR_PREV_LINK) + '"></a>',
		rowsPerPage: '<select class="' + CSS_PAGINATOR_ROWS_PER_PAGE + '"></select>',
		total: '<span class="' + concat(CSS_PAGINATOR_TOTAL) + '"></span>',
		totalLabel: '(Total {total})'
	},
	GT_TPL = '&gt;',
	LT_TPL = '&lt;',

	REGEX_ATTR_SELECTED = /selected(?:="")*/gi;

/**
 * <p><img src="assets/images/aui-paginator/main.png"/></p>
 *
 * A base class for Paginator, providing:
 * <ul>
 *    <li>Widget Lifecycle (initializer, renderUI, bindUI, syncUI, destructor)</li>
 *    <li>Set of controls to navigate through paged data</li>
 * </ul>
 *
 * Quick Example:<br/>
 *
 * <pre><code>var instance = new A.Paginator({
 *	containers: '.paginatorA',
 *	total: 10,
 *	maxPageLinks: 10,
 *	rowsPerPage: 1,
 *	rowsPerPageOptions: [ 1, 3, 5, 7 ]
 * }).render();
 * </code></pre>
 *
 * Check the list of <a href="Paginator.html#configattributes">Configuration Attributes</a> available for
 * Paginator.
 *
 * @param config {Object} Object literal specifying widget configuration properties.
 *
 * @class Paginator
 * @constructor
 * @extends Base
 */
var PaginatorOld = A.Component.create(
	{
		/**
		 * Static property provides a string to identify the class.
		 *
		 * @property Paginator.NAME
		 * @type String
		 * @static
		 */
		NAME: PAGINATOR,

		TPL: DEFAULT_TPL,

		/**
		 * Static property used to define the default attribute
		 * configuration for the Paginator.
		 *
		 * @property Paginator.ATTRS
		 * @type Object
		 * @static
		 */
		ATTRS: {
			/**
			 * If true the Paginator will be always visible, even when the number
			 * of pages is 0. To hide the paginator controls automatically when
			 * there is no pages to display use <code>false</code>.
			 *
			 * @attribute alwaysVisible
			 * @default true
			 * @type boolean
			 */
			alwaysVisible: {
				validator: isBoolean,
				value: true
			},

			circular: {
				validator: isBoolean,
				value: false
			},

			/**
			 * The Paginator controls UI could be displayed in more than one
			 * container (i.e., in the header and footer of a list). Pass a
			 * <a href="NodeList.html">NodeList</a> or a selector to grab the
			 * containers.
			 *
			 * @attribute containers
			 * @default null
			 * @type Node | String
			 */
			containers: {
				setter: function(value) {
					var instance = this;

					if (isNodeList(value)) {
						return value;
					}
					else if (isString(value)) {
						return A.all(value);
					}

					return new A.NodeList([value]);
				},
				writeOnce: true
			},

			/**
			 * The label used as content of the
			 * <a href="Paginator.html#config_firstPageLink">firstPageLink</a> element.
			 *
			 * @attribute firstPageLinkLabel
			 * @default 'first'
			 * @type String
			 */
			firstPageLinkLabel: {
				validator: isString,
				value: FIRST
			},

			/**
			 * The label used as content of the
			 * <a href="Paginator.html#config_lastPageLink">lastPageLink</a> element.
			 *
			 * @attribute lastPageLinkLabel
			 * @default 'last'
			 * @type String
			 */
			lastPageLinkLabel: {
				validator: isString,
				value: LAST
			},

			/**
			 * The max number of page links to be displayed. If lower than the
			 * total number of pages they are still navigable using next and prev
			 * links.
			 *
			 * @attribute maxPageLinks
			 * @default 10
			 * @type Number
			 */
			maxPageLinks: {
				getter: function(value) {
					var totalPages = this.get(TOTAL_PAGES);

					// maxPageLinks cannot be bigger than totalPages
					return Math.min(totalPages, value);
				},
				validator: isNumber,
				value: 10
			},

			/**
			 * The label used as content of the
			 * <a href="Paginator.html#config_nextPageLink">nextPageLink</a> element.
			 *
			 * @attribute nextPageLinkLabel
			 * @default 'next &gt;'
			 * @type String
			 */
			nextPageLinkLabel: {
				validator: isString,
				value: concat(NEXT, GT_TPL)
			},

			/**
			 * Page to display on initial paint.
			 *
			 * @attribute page
			 * @default 1
			 * @type Number
			 */
			page: {
				setter: toInt,
				value: 1
			},

			/**
			 * <p>Function which set the content of the each page element. The passed
			 * function receive as arguments the reference for the page element
			 * node, the page number and the index of the page element.</p>
			 *
			 * Example:
			 *
			 * <pre><code>function(pageEl, pageNumber, index) {
			 *	 pageEl.html(pageNumber);
			 *	}</code></pre>
			 *
			 * @attribute pageLinkContent
			 * @default Basic function to set the html of the page element with the page number.
			 * @type function
			 */
			pageLinkContent: {
				validator: isFunction,
				value: function(pageEl, pageNumber, index) {
					pageEl.html(pageNumber);
				}
			},

			/**
			 * The label used as content of the
			 * <a href="Paginator.html#config_prevPageLink">prevPageLink</a> element.
			 *
			 * @attribute prevPageLinkLabel
			 * @default '&lt; prev'
			 * @type String
			 */
			prevPageLinkLabel: {
				validator: isString,
				value: concat(LT_TPL, PREV)
			},

			/**
			 * Number of records constituting a "page".
			 *
			 * @attribute rowsPerPage
			 * @default 1
			 * @type Number
			 */
			rowsPerPage: {
				setter: toInt,
				value: 1
			},

			/**
			 * Array to be displayed on the generated HTML Select element with the
			 * <a href="Paginator.html#config_rowsPerPage">rowsPerPage</a>
			 * information. (i.e., [1,3,5,7], will display these values on the
			 * select)
			 *
			 * @attribute rowsPerPageOptions
			 * @default []
			 * @type Array
			 */
			rowsPerPageOptions: {
				validator: isArray,
				value: []
			},

			/**
			 * Generates information to the <code>changeRequest</code> event. See
			 * <a href="Paginator.html#method_changeRequest">changeRequest</a>.
			 *
			 * @attribute state
			 * @default {}
			 * @type Object
			 */
			state: {
				getter: '_getState',
				setter: '_setState',
				validator: isObject,
				value: {}
			},

			/**
			 * Total number of records to paginate through.
			 *
			 * @attribute total
			 * @default 0
			 * @type Number
			 */
			total: {
				setter: '_setTotal',
				validator: isNumber,
				value: 0
			},

			/**
			 * The label markup to the total information.
			 *
			 * @attribute totalLabel
			 * @default '(Total {total})'
			 * @type String
			 */
			totalLabel: {
				getter: function() {
					var instance = this;

					return L.sub(
						instance.configTpl.totalLabel,
						{
							total: instance.get(TOTAL)
						}
					);
				},
				validator: isString
			},

			/**
			 * Number of pages. Calculated based on the
			 * <a href="Paginator.html#config_total">total</a> divided by the
			 * <a href="Paginator.html#config_rowsPerPage">rowsPerPage</a>.
			 *
			 * @attribute totalPages
			 * @default 0
			 * @type Number
			 */
			totalPages: {
				readOnly: true,
				getter: function(value) {
					var instance = this;

					var rowsPerPage = instance.get(ROWS_PER_PAGE);
					var total = instance.get(TOTAL);

					return Math.ceil(total / rowsPerPage);
				}
			}
		},

		constructor: function(config) {
			var instance = this;

			var configTpl = config.TPL || {};

			A.mix(configTpl, PaginatorOld.TPL);

			instance.configTpl = configTpl;

			PaginatorOld.superclass.constructor.call(instance, config);
		},

		prototype: {
			/**
			 * Store the last state object used on the <a href="Paginator.html#method_changeRequest">changeRequest</a> event.
			 *
			 * @property lastState
			 * @type Object | null
			 * @protected
			 */
			lastState: null,

			/**
			 * Cached template after <a href="YUI.html#method_substitute">YUI
			 * substitute</a> were applied.
			 *
			 * @property templatesCache
			 * @type String
			 * @protected
			 */
			templatesCache: null,

			/**
			 * Create the DOM structure for the Paginator. Lifecycle.
			 *
			 * @method renderUI
			 * @protected
			 */
			renderUI: function() {
				var instance = this;

				var containers = instance.get(CONTAINERS);

				containers.unselectable();

				instance._renderRowsPerPageOptions();

				instance._renderTemplateUI();

				containers.addClass(CSS_PAGINATOR_CONTAINER);
			},

			/**
			 * Bind the events on the Paginator UI. Lifecycle.
			 *
			 * @method bindUI
			 * @protected
			 */
			bindUI: function() {
				var instance = this;

				instance._delegateDOM();

				instance.publish('changeRequest');
				instance.after('stateChange', A.bind(instance._afterSetState, instance));
				instance.before('stateChange', A.bind(instance._beforeSetState, instance));

				instance.after('maxPageLinksChange', A.bind(instance._renderTemplateUI, instance));
				instance.after('rowsPerPageChange', A.bind(instance._renderTemplateUI, instance));
				instance.after('totalChange', A.bind(instance._renderTemplateUI, instance));
			},

			/**
			 * Sync the Paginator UI. Lifecycle.
			 *
			 * @method syncUI
			 * @protected
			 */
			syncUI: function() {
				var instance = this;

				instance.changeRequest();
			},

			/**
			 * Descructor lifecycle implementation for the Paginator class.
			 * Purges events attached to the node (and all child nodes).
			 *
			 * @method destructor
			 * @protected
			 */
			destructor: function() {
				var instance = this;

				instance.get(CONTAINERS).remove(true);
			},

			/**
			 * Create a range to display on the pageLinks, keep the current page on
			 * center.
			 *
			 * @method calculateRange
			 * @param {Type} name description
			 * @return {Object} Object containing the start and end information.
			 */
			calculateRange: function(page) {
				var instance = this;

				var maxPageLinks = instance.get(MAX_PAGE_LINKS);
				var totalPages = instance.get(TOTAL_PAGES);

				var offset = Math.ceil(maxPageLinks/2);

				// this fixes when the offset is small and generates less than [maxPageLinks] page links
				var start = Math.min(
					// Math.max(x, 1) doesn't allow negative or zero values
					Math.max(page - offset, 1), (totalPages - maxPageLinks + 1)
				);

				// (start + maxPageLinks - 1) try to find the end range
				// Math.min with totalPages doesn't allow values bigger than totalPages
				var end = Math.min(start + maxPageLinks - 1, totalPages);

				return {
					end: end,
					start: start
				};
			},

			/**
			 * Fires <a href="Paginator.html#event_changeRequest">changeRequest</a>
			 * event. This is the most important event because it's responsible to
			 * update the UI, invoked <code>.setState(newState)</code> to update the
			 * UI.
			 *
			 * @method changeRequest
			 */
			changeRequest: function() {
				var instance = this;

				var state = instance.get(STATE);

				if (instance.get(CIRCULAR)) {
					var page = state.page;
					var totalPages = state.totalPages;

					if (state.before && (state.before.page == page)) {
						if (page <= 1) {
							state.page = totalPages;
						}
						else if (page >= totalPages) {
							state.page = 1;
						}

						instance.set(STATE, state);
					}
				}

				instance.fire(
					'changeRequest',
					{
						state: state
					}
				);
			},

			/**
			 * Loop through all
			 * <a href="Paginator.html#config_containers">containers</a> and execute the
			 * passed callback.
			 *
			 * @method eachContainer
			 * @param {function} fn Callback
			 */
			eachContainer: function(fn) {
				var instance = this;

				instance.get(CONTAINERS).each(
					function(node) {
						if (node) {
							fn.apply(instance, arguments);
						}
					}
				);
			},

			/**
			 * Check if there is a next page.
			 *
			 * @method hasNextPage
			 * @return {boolean}
			 */
			hasNextPage: function() {
				var instance = this;

				var nextPage = instance.get(PAGE) + 1;

				return instance.hasPage(nextPage);
			},

			/**
			 * Check if the <code>page</code> exists.
			 *
			 * @method hasPage
			 * @param {Number} page
			 * @return {boolean}
			 */
			hasPage: function(page) {
				var instance = this;

				var totalPages = instance.get(TOTAL_PAGES);

				return ((page > 0) && (page <= totalPages));
			},

			/**
			 * Check if there is a previous page.
			 *
			 * @method hasPrevPage
			 * @return {boolean}
			 */
			hasPrevPage: function() {
				var instance = this;

				var prevPage = instance.get(PAGE) - 1;

				return instance.hasPage(prevPage);
			},

			/**
			 * Public setter for <a href="Paginator.html#config_state">state</a>.
			 *
			 * @method setState
			 * @param {Object} v New state object.
			 */
			setState: function(value) {
				var instance = this;

				instance.set(STATE, value);
			},

			/**
			 * Fires after the value of the
			 * <a href="Paginator.html#config_state">state</a> attribute change.
			 *
			 * @method _afterSetState
			 * @param {EventFacade} event
			 * @protected
			 */
			_afterSetState: function(event) {
				var instance = this;

				instance._syncPageLinksUI();
				instance._syncPageReportUI();
			},

			/**
			 * Fires before the value of the
			 * <a href="Paginator.html#config_state">state</a> attribute change.
			 *
			 * @method _beforeSetState
			 * @param {EventFacade} event
			 * @protected
			 */
			_beforeSetState: function(event) {
				var instance = this;

				instance.lastState = event.prevVal;
			},

			/**
			 * Bind DOM events on the Paginator UI.
			 *
			 * @method _bindDOMEvents
			 * @protected
			 */
			_bindDOMEvents: function() {
				var instance = this;

				var rowsPerPage = instance.get(ROWS_PER_PAGE);

				instance.eachContainer(
					function(node) {
						var rowsPerPageEl = node.one(DOT + CSS_PAGINATOR_ROWS_PER_PAGE);

						if (rowsPerPageEl) {
							rowsPerPageEl.val(rowsPerPage);

							rowsPerPageEl.detach('change');

							rowsPerPageEl.on(
								'change',
								function(event) {
									try {
										rowsPerPage = event.target.val();
									}
									catch(e) {
									}

									instance.set(PAGE, 1);

									instance.set(ROWS_PER_PAGE, rowsPerPage);

									instance.changeRequest();
								}
							);
						}
					}
				);
			},

			/**
			 * Create nodes and labels
			 *
			 * @method _createNode
			 * @protected
			 */
			_createNode: function(element, label) {
				var instance = this;

				var node = A.Node.create(element);

				if (label) {
					node.html(label);
				}

				return node;
			},

			/**
			 * Delegate DOM events on the Paginator UI.
			 *
			 * @method _delegateDOM
			 * @protected
			 */
			_delegateDOM: function() {
				var instance = this;

				instance.eachContainer(
					function(node, i) {
						node.delegate('click', A.bind(instance._onClickFirstLinkEl, instance), DOT + CSS_PAGINATOR_FIRST_LINK);
						node.delegate('click', A.bind(instance._onClickLastLinkEl, instance), DOT + CSS_PAGINATOR_LAST_LINK);
						node.delegate('click', A.bind(instance._onClickNextLinkEl, instance), DOT + CSS_PAGINATOR_NEXT_LINK);
						node.delegate('click', A.bind(instance._onClickPageLinkEl, instance), DOT + CSS_PAGINATOR_PAGE_LINK);
						node.delegate('click', A.bind(instance._onClickPrevLinkEl, instance), DOT + CSS_PAGINATOR_PREV_LINK);
					}
				);
			},

			/**
			 * Private getter for <a href="Paginator.html#config_state">state</a>.
			 *
			 * @method _getState
			 * @param {Object} v Current state object.
			 * @protected
			 * @return {Object} State object.
			 */
			_getState: function(value) {
				var instance = this;

				return {
					before: instance.lastState,
					page: instance.get(PAGE),
					paginator: instance,
					rowsPerPage: instance.get(ROWS_PER_PAGE),
					total: instance.get(TOTAL),
					totalPages: instance.get(TOTAL_PAGES)
				};
			},

			/**
			 * Getter for <a href="Paginator.html#config_template">template</a>.
			 *
			 * @method _getTemplate
			 * @param {String} v Current template.
			 * @protected
			 * @return {String} Current template.
			 */
			_getTemplate: function(value) {
				var instance = this;

				var page = 0;

				var paginatorLinkCSS = concat(CSS_PAGINATOR_LINK, CSS_PAGINATOR_PAGE_LINK);

				var configTpl = instance.configTpl;

				var maxPageLinks = instance.get(MAX_PAGE_LINKS);

				var pageLinkEl = configTpl.pageLink;

				var rowsPerPageEl = instance._rowsPerPageEl;

				var firstPageLink = instance._createNode(configTpl.firstLink, instance.get(FIRST_PAGE_LINK_LABEL));
				var lastPageLink = instance._createNode(configTpl.lastLink, instance.get(LAST_PAGE_LINK_LABEL));
				var nextPageLink = instance._createNode(configTpl.nextLink, instance.get(NEXT_PAGE_LINK_LABEL));
				var pageContainer = instance._createNode(configTpl.pageContainer);
				var pageReportLink = instance._createNode(configTpl.pageReport, instance._pageReportLabel);
				var prevPageLink = instance._createNode(configTpl.prevLink, instance.get(PREV_PAGE_LINK_LABEL));
				var totalLink = instance._createNode(configTpl.total, instance.get(TOTAL_LABEL));

				pageContainer.addClass(CSS_PAGINATOR_PAGE_CONTAINER);

				while (page++ < maxPageLinks) {
					var pageLink = instance._createNode(pageLinkEl);

					pageLink.addClass(paginatorLinkCSS);

					pageContainer.append(pageLink);
				}

				var rowsPerPageElOuterHTML;

				if (rowsPerPageEl) {
					var options = rowsPerPageEl.all(OPTION);

					rowsPerPageElOuterHTML = rowsPerPageEl.outerHTML();

					if (IE) {
						rowsPerPageElOuterHTML = rowsPerPageElOuterHTML.replace(REGEX_ATTR_SELECTED, '');

						var rowsPerPage = instance.get(ROWS_PER_PAGE);

						var itemValue = 'value="' + rowsPerPage + '"';

						if (IE < 9) {
							itemValue = 'value=' + rowsPerPage;
						}

						rowsPerPageElOuterHTML = rowsPerPageElOuterHTML.replace(new RegExp(itemValue), itemValue + ' selected');
					}
				}

				instance.templates = L.sub(
					value,
					{
						CurrentPageReport: pageReportLink.outerHTML(),
						FirstPageLink: firstPageLink.outerHTML(),
						LastPageLink: lastPageLink.outerHTML(),
						NextPageLink: nextPageLink.outerHTML(),
						PageLinks: pageContainer.outerHTML(),
						PrevPageLink: prevPageLink.outerHTML(),
						RowsPerPageSelect: rowsPerPageElOuterHTML,
						Total: totalLink.outerHTML()
					}
				);

				return instance.templates;
			},

			/**
			 * Click event handler for the
			 * <a href="Paginator.html#config_firstLinkEl">firstLinkEl</a>.
			 *
			 * @method _onClickFirstLinkEl
			 * @param {EventFacade} event
			 * @protected
			 */
			_onClickFirstLinkEl: function(event) {
				var instance = this;

				instance.set(PAGE, 1);

				instance.changeRequest();

				event.halt();
			},

			/**
			 * Click event handler for the
			 * <a href="Paginator.html#config_lastLinkEl">lastLinkEl</a>.
			 *
			 * @method _onClickLastLinkEl
			 * @param {EventFacade} event
			 * @protected
			 */
			_onClickLastLinkEl: function(event) {
				var instance = this;

				var totalPages = instance.get(TOTAL_PAGES);

				instance.set(PAGE, totalPages);

				instance.changeRequest();

				event.halt();
			},

			/**
			 * Click event handler for the
			 * <a href="Paginator.html#config_nextLinkEl">nextLinkEl</a>.
			 *
			 * @method _onClickNextLinkEl
			 * @param {EventFacade} event
			 * @protected
			 */
			_onClickNextLinkEl: function(event) {
				var instance = this;

				var page = instance.get(PAGE);

				var nextPage = instance.hasNextPage() ? page + 1 : page;

				instance.set(PAGE, nextPage);

				instance.changeRequest();

				event.halt();
			},

			/**
			 * Click event handler for the
			 * <a href="Paginator.html#config_pageLinkEl">pageLinkEl</a>.
			 *
			 * @method _onClickPageLinkEl
			 * @param {EventFacade} event
			 * @protected
			 */
			_onClickPageLinkEl: function(event) {
				var instance = this;

				var pageNumber = event.currentTarget.attr(PAGE);

				instance.set(PAGE, pageNumber);

				instance.changeRequest();

				event.halt();
			},

			/**
			 * Click event handler for the
			 * <a href="Paginator.html#config_prevLinkEl">prevLinkEl</a>.
			 *
			 * @method _onClickPrevLinkEl
			 * @param {EventFacade} event
			 * @protected
			 */
			_onClickPrevLinkEl: function(event) {
				var instance = this;

				var page = instance.get(PAGE);

				var prevPage = (instance.hasPrevPage() ? page - 1 : page);

				instance.set(PAGE, prevPage);

				instance.changeRequest();

				event.halt();
			},

			/**
			 * Render rows per page options.
			 *
			 * @method _renderRowsPerPageOptions
			 * @protected
			 */
			_renderRowsPerPageOptions: function() {
				var instance = this;

				var rowsPerPage = instance.get(ROWS_PER_PAGE);
				var rowsPerPageOptions = instance.get(ROWS_PER_PAGE_OPTIONS);

				var rowsPerPageTpl = instance.configTpl.rowsPerPage;

				var rowsPerPageEl = instance._createNode(rowsPerPageTpl);

				var options = rowsPerPageEl.all(OPTION);

				rowsPerPageEl.addClass(CSS_PAGINATOR_ROWS_PER_PAGE);

				options.removeAttribute(SELECTED);

				var selected = options.filter('[value=' + rowsPerPage + ']');

				if (selected) {
					selected.setAttribute(SELECTED, SELECTED);
				}

				A.each(
					rowsPerPageOptions,
					function(item, index, collection) {
						var rowsPerPageDOM = rowsPerPageEl.getDOM();

						rowsPerPageDOM.options[index] = new Option(item, item);
					}
				);

				instance._rowsPerPageEl = rowsPerPageEl;
			},

			/**
			 * Render the UI controls based on the
			 * <a href="Paginator.html#config_template">template</a>.
			 *
			 * @method _renderTemplateUI
			 * @protected
			 */
			_renderTemplateUI: function() {
				var instance = this;

				var containers = instance.get(CONTAINERS);

				instance._getTemplate(instance.configTpl.defaultOutput);

				containers.html(instance.templates);

				instance._syncPageLinksUI();
				instance._syncPageReportUI();
				instance._bindDOMEvents();
			},

			/**
			 * Private setter for <a href="Paginator.html#config_state">state</a>.
			 *
			 * @method _setState
			 * @param {Object} v New state object.
			 * @protected
			 * @return {Object}
			 */
			_setState: function(value) {
				var instance = this;

				A.each(
					value,
					function(val, key) {
						instance.set(key, val);
					}
				);

				return value;
			},

			/**
			 * Setter for <a href="Paginator.html#config_total">total</a>.
			 *
			 * @method _setTotal
			 * @param {Number} v
			 * @protected
			 * @return {Number}
			 */
			_setTotal: function(value) {
				var instance = this;

				var alwaysVisible = instance.get(ALWAYS_VISIBLE);
				var rowsPerPage = instance.get(ROWS_PER_PAGE);

				var visible = (alwaysVisible || (value !== 0 && value > rowsPerPage));

				instance.get(CONTAINERS).toggle(visible);

				return value;
			},

			/**
			 * Sync the Paginator links UI.
			 *
			 * @method _syncPageLinksUI
			 * @protected
			 */
			_syncPageLinksUI: function() {
				var instance = this;

				var page = instance.get(PAGE);

				var range = instance.calculateRange(page);

				instance.get(CONTAINERS).each(
					function(node) {
						var index = 0;
						var pageNumber = range.start;

						var pageLinks = node.all(DOT + CSS_PAGINATOR_PAGE_LINK);

						if (pageLinks.size()) {
							pageLinks.removeClass(CSS_PAGINATOR_CURRENT_PAGE);

							while (pageNumber <= range.end) {
								var pageLinkContent = instance.get(PAGE_LINK_CONTENT);

								var pageEl = pageLinks.item(index);

								pageLinkContent.apply(instance, [pageEl, pageNumber, index]);

								pageEl.setAttribute(PAGE, pageNumber);

								if (pageNumber == page) {
									pageEl.addClass(CSS_PAGINATOR_CURRENT_PAGE);
								}

								index++;
								pageNumber++;
							}
						}
					}
				);
			},

			/**
			 * Sync the Paginator page report UI.
			 *
			 * @method _syncPageLinksUI
			 * @protected
			 */
			_syncPageReportUI: function(event) {
				var instance = this;

				instance._pageReportLabel = L.sub(
					instance.configTpl.pageReportLabel,
					{
						page: instance.get(PAGE),
						totalPages: instance.get(TOTAL_PAGES)
					}
				);

				instance.get(CONTAINERS).each(
					function(node) {
						var pageReportEl = node.one(DOT + CSS_PAGINATOR_PAGE_REPORT);

						if (pageReportEl) {
							pageReportEl.html(instance._pageReportLabel);
						}
					}
				);
			}
		}
	}
);

A.PaginatorOld = PaginatorOld;

}, '1.7.0' ,{requires:['aui-base'], skinnable:false});
