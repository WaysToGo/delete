import * as React from "react";
import { Panel, Accordion, PanelGroup, Pagination } from "react-bootstrap";
import * as _ from "lodash";
import {
  generateAddButton,
  generateRemoveButton,
  generateUpButton,
  generateDownButton
} from "./buttons";
import * as helper from "../../utils";
import ReactHtmlParser from "react-html-parser";

export function AccordionArray(props) {
  return <AccordionArrayComponent {...props} />;
}

class AccordionArrayComponent extends React.Component<any, any> {
  constructor(props) {
    super(props);

    let pageSize;
    if (this.props.uiSchema["ui:options"]["pageSize"]) {
      pageSize = this.props.uiSchema["ui:options"]["pageSize"];
    } else if (props.formContext.pageSize) {
      pageSize = props.formContext.pageSize;
    } else {
      pageSize = -1;
    }

    if (
      props.formContext &&
      props.formContext.accordionActiveId === props.idSchema.$id &&
      !_.isNil(props.formContext.accordionActiveKey)
    ) {
      this.state = {
        activeKey: this.props.formContext.accordionActiveKey,
        uiSchema: props.uiSchema,
        prevProps: null,
        activePage: props.formContext.activePage || 1,
        pageSize: pageSize
      };
    } else {
      this.state = {
        activeKey: 0,
        uiSchema: props.uiSchema,
        prevProps: null,
        activePage: props.formContext.activePage || 1,
        pageSize: pageSize
      };
    }

    this._handleToggle = this._handleToggle.bind(this);
    this._isVisible = this._isVisible.bind(this);
    this._changePage = this._changePage.bind(this);
    this._onPageSizeChange = this._onPageSizeChange.bind(this);
    this._getPaginationComponent = this._getPaginationComponent.bind(this);
  }

  _changePage(eventKey) {
    const _stateData = _.clone(this.state);
    _stateData.activePage = eventKey;
    this.setState(_stateData);
    if (this.props.formContext.onServiceAPICall) {
      this.props.formContext.onServiceAPICall(_stateData);
    }
  }
  _onPageSizeChange(event) {
    const _stateData = _.clone(this.state);
    const value = event.target.value;
    _stateData.pageSize = parseInt(value, 10);
    _stateData.activePage = 1;
    this.setState(_stateData);
    if (this.props.formContext.onServiceAPICall) {
      this.props.formContext.onServiceAPICall(_stateData);
    }
  }

  _getPaginationComponent() {
    const { uiSchema, items, formContext } = this.props;
    const { pageSize } = this.state;
    const uiOptions = uiSchema["ui:options"];
    const { paginationParams } = uiOptions;
    const paramObj = paginationParams || {};
    const paginationContainerClass =
      paramObj.paginationContainerClass ||
      "col-md-12 col-xs-12 col-sm-12 no-padding";
    const isEnablePageSizeList = paramObj.isEnablePageSizeList || false;
    const _pageSizeValues = paramObj.pageSizeValues || [
      5,
      10,
      15,
      20,
      25,
      30,
      50,
      100
    ];
    paramObj.totalRecords = formContext.totalRecordsCount || 0;
    const totalRecords = paramObj.totalRecords || (items && items.length);
    const paginationAlignClass = paramObj.paginationAlignClass || "pull-right";
    const displayingLabelAlignClass =
      paramObj.displayingLabelAlignClass || "pull-left";
    const viewListClass = paramObj.viewListClass || "";
    const isElipsesEnabled = paramObj.hasOwnProperty("isElipsesEnabled")
      ? paramObj.isElipsesEnabled
      : true;
    const _boundaryLinksEnabled = paramObj.hasOwnProperty(
      "boundaryLinksEnabled"
    )
      ? paramObj.boundaryLinksEnabled
      : true;
    let _maxButtons = paramObj.maxButtons >= 0 ? paramObj.maxButtons : 5;
    const numberOfPages = Math.ceil(totalRecords / pageSize);
    _maxButtons = _maxButtons < numberOfPages ? _maxButtons : numberOfPages;

    const spellOut = paramObj.enableWordLabels;
    const paginationObj = (
      <Pagination
        prev={spellOut ? "Previous" : "‹"}
        next={spellOut ? "Next" : "›"}
        first={spellOut ? "First" : "«"}
        last={spellOut ? "Last" : "»"}
        ellipsis={isElipsesEnabled}
        boundaryLinks={_boundaryLinksEnabled}
        items={numberOfPages}
        maxButtons={_maxButtons}
        activePage={this.state.activePage}
        onSelect={this._changePage}
      />
    );
    const _enableDisplayingLabel = paramObj.enableDisplayingLabel;
    let displayingLabel = null;
    if (_enableDisplayingLabel) {
      const activePage = this.state.activePage;
      const start = pageSize * activePage - pageSize + 1;
      const end =
        activePage === numberOfPages
          ? start + ((totalRecords % pageSize) - 1)
          : pageSize * this.state.activePage;
      displayingLabel = (
        <div className={displayingLabelAlignClass}>
          <span>
            Displaying {start} - {end}
          </span>
        </div>
      );
    }

    return (
      <div className={paginationContainerClass}>
        {isEnablePageSizeList ? (
          <div>
            <div className="col-md-4 col-sm-3 col-xs-3">
              <label>
                <span className="padding-5x">View</span>
                <select
                  className={viewListClass}
                  value={pageSize}
                  onChange={this._onPageSizeChange.bind(this)}
                >
                  {_pageSizeValues.map((pSizeValue, index) => {
                    return (
                      <option
                        key={index + 1}
                        label={pSizeValue}
                        defaultValue={pageSize}
                      >
                        {pSizeValue}
                      </option>
                    );
                  })}
                </select>
                <span className="padding-5x">per page</span>
              </label>
            </div>
            <div className="col-md-8 col-sm-9 col-xs-10">
              {displayingLabel}
              <div className={paginationAlignClass}>{paginationObj}</div>
            </div>
          </div>
        ) : (
          <div>
            {displayingLabel}
            <div className={paginationAlignClass}>{paginationObj}</div>
          </div>
        )}
      </div>
    );
  }

  static getDerivedStateFromProps(props, state) {
    if (state.prevProps !== props) {
      if (
        props.formContext &&
        props.formContext.accordionActiveId === props.idSchema.$id &&
        !_.isNil(props.formContext.accordionActiveKey) &&
        props.formContext.accordionActiveKey !== state.activeKey
      ) {
        return {
          activeKey: props.formContext.accordionActiveKey,
          uiSchema: props.uiSchema,
          prevProps: props
        };
      } else if (!_.isEqual(props.uiSchema, state.uiSchema)) {
        return {
          activeKey: 0,
          uiSchema: props.uiSchema,
          prevProps: props
        };
      } else {
        return null;
      }
    }
  }

  _notifyAccordionActiveKeyChanged = () => {
    if (
      this.props.formContext &&
      this.props.formContext.setAccordionActiveKey
    ) {
      this.props.formContext.setAccordionActiveKey(
        this.props.idSchema.$id,
        this.state.activeKey
      );
    }
  };

  _handleToggle = (activeKey, event) => {
    event.preventDefault();
    if (activeKey === this.state.activeKey)
      this.setState({ activeKey: -1 }, this._notifyAccordionActiveKeyChanged);
    else this.setState({ activeKey }, this._notifyAccordionActiveKeyChanged);
  };

  _isVisible(element) {
    if (!this.props.uiSchema || !this.props.uiSchema["ui:eachVisibleIf"]) {
      return true;
    } else {
      try {
        var f = new Function(
          "key",
          "formData",
          "return (" +
            helper.resolveStringRefs(
              this.props.uiSchema["ui:eachVisibleIf"],
              element.children.props.formContext ||
                element.children.props.registry.formContext,
              element.children.props.idSchema.$id,
              element.children.props.formData,
              element.children.props.schema,
              element.children.props.uiSchema
            ) +
            ")"
        );
        return f(
          element.children.props.schema.key,
          element.children.props.formData
        );
      } catch (err) {
        console.error("AccordionArray eachVisibleIf error", err);
        return true;
      }
    }
  }

  render() {
    const defaultPageSize = 5;
    const { schema, uiSchema, idSchema, items } = this.props;

    const props = this.props;
    const activeKey = this.state.activeKey;
    const accordionOptions = uiSchema["ui:options"];
    const { pagination } = accordionOptions;
    let newItems = [...items];
    let paginationButtons = null;

    if (pagination) {
      paginationButtons = this._getPaginationComponent();
      const ps = this.state.pageSize ? this.state.pageSize : defaultPageSize;
      /**
       * @ServiceCall : this.props.formContext.onServiceAPICall
       * @Description: This block checks if backend call is available for
       *               Every page changing, then no need to slice the
       *               items.
       */
      if (!this.props.formContext.onServiceAPICall) {
        const copyOfItems = newItems;
        newItems = copyOfItems.slice(
          (this.state.activePage - 1 ? this.state.activePage - 1 : 0) * ps,
          this.state.activePage * ps
        );
      }
    }
    let _pageSize = this.state.pageSize ? this.state.pageSize : defaultPageSize;

    return (
      <PanelGroup id={idSchema.$id}>
        {props.canAdd &&
          uiSchema["ui:options"] &&
          uiSchema["ui:options"]["isCustomButtonEnable"] && (
            <div className="row">{generateAddButton(props)}</div>
          )}
        {props.items &&
          props.items.filter(this._isVisible).map(element => {
            let title;
            let newChildren = element.children;
            if (
              uiSchema["ui:options"] &&
              uiSchema["ui:options"]["useChildTitle"]
            ) {
              title = element.children.props.schema.title;
              newChildren = {
                ...element.children,
                props: {
                  ...element.children.props,
                  schema: {
                    ...element.children.props.schema,
                    title: null
                  }
                }
              };
              delete newChildren.props.schema["title"];
            } else if (
              uiSchema["ui:options"] &&
              uiSchema["ui:options"]["rightTitle"]
            ) {
              title =
                props.schema.title +
                "<span style='float:right; padding-right:10px;'>" +
                uiSchema["ui:options"]["rightTitle"] +
                "</span>";
            } else {
              title = props.schema.title;
            }

            let header;

            header = helper.resolveStringRefs(
              title,
              props.formContext,
              newChildren.props.idSchema.$id,
              null,
              null,
              null
            );
            if (
              header &&
              header.indexOf("<") > -1 &&
              header.indexOf(">") > -1
            ) {
              header = ReactHtmlParser(header);
            }
            {
              accordionInfo(items, _pageSize, this.state.activePage);
            }
            return (
              <Panel
                id={newChildren.props.idSchema.$id}
                key={newChildren.props.idSchema.$id}
                header={header}
                onSelect={this._handleToggle}
                eventKey={element.index}
                expanded={activeKey === element.index}
                collapsible
              >
                <div>{newChildren}</div>
                {element.hasMoveDown && generateDownButton(props, element)}
                {element.hasMoveUp && generateUpButton(props, element)}
                {element.hasRemove &&
                  (typeof schema.minItems === "undefined" ||
                    (items.length > schema.minItems && element.index > 0)) &&
                  generateRemoveButton(props, element)}
              </Panel>
            );
          })}
        {accordionInfo(items, _pageSize, this.state.activePage)} // check this
        line
        {props.canAdd &&
          !(
            uiSchema["ui:options"] &&
            uiSchema["ui:options"]["isCustomButtonEnable"]
          ) && <div className="row">{generateAddButton(props)}</div>}
        {paginationButtons}
      </PanelGroup>
    );
  }
}

function accordionInfo(items, pageSize, activePage) {
  return (
    <span className="hidden">
      {"Showing " +
        (pageSize != -1
          ? pageSize * activePage > items.length
            ? items.length % pageSize
            : pageSize
          : items.length) +
        " out of " +
        items.length}
    </span>
  );
}
