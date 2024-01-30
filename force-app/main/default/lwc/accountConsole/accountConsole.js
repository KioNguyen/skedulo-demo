import { LightningElement, track, wire } from "lwc";

import getAccountTypes from "@salesforce/apex/AccountController.getAccountTypes";
import getAccounts from "@salesforce/apex/AccountController.getAccounts";

export default class AccountConsole extends LightningElement {
  greeting = "World";
  changeHandler(event) {
    this.greeting = event.target.value;
  }

  @track columns = [
    {
      label: "Account name",
      fieldName: "Id",
      type: "objectUrl",
      typeAttributes: {
        label: { fieldName: "Name" },
        objectType: "Account",
        action: "view"
      },
      hideDefaultActions: true
    },
    {
      label: "Owner",
      fieldName: "OwnerId",
      type: "objectUrl",
      typeAttributes: {
        label: { fieldName: "OwnerName" },
        objectType: "User",
        action: "view"
      },
      hideDefaultActions: true
    },
    {
      label: "Phone",
      fieldName: "Phone",
      type: "phone",
      hideDefaultActions: true
    },
    {
      label: "Annual Revenue",
      fieldName: "AnnualRevenue",
      type: "currency",
      typeAttributes: { currencyCode: "USD", currencyDisplayAs: "symbol" },
      hideDefaultActions: true
    },
    {
      label: "Last Modified Date",
      fieldName: "LastModifiedDate",
      type: "relativeTime",
      hideDefaultActions: true
    }
  ];

  //Filter
  @track name = "";
  @track selectedType = "";
  @track annualRevenue = 0;
  @track ownerId;
  @track minAnnualRevenue = 0;
  @track maxAnnualRevenue = 0;
  @track typeOptions = [];

  filter = {
    name: this.name,
    type: this.type,
    annualRevenue: this.annualRevenue,
    ownerId: this.ownerId
  };

  filterCriteria = {
    criteria: [
      {
        fieldPath: "Name",
        operator: "LIKE"
      }
    ]
  };

  matchingInfo = {
    primaryField: { fieldPath: "Name" }
  };

  //Pagination
  @track error;
  @track accList;
  @track total = 0;
  @track totalPage = 0;
  @track currPage = 0;
  @track limit = 10;
  @track offset = 0;
  @track isLoading = false;
  @track disabledPrevious = true;
  @track disabledNext = true;
  @wire(getAccounts, { lim: "$limit", off: "$offset", filter: "$filter" })
  wiredAccounts({ error, data }) {
    if (data) {
      const accounts = data.items.map((item) => {
        return {
          ...item,
          OwnerName: item.Owner.Name,
          LastModifiedDate: new Date(item.LastModifiedDate)
        };
      });
      this.accList = accounts;
      this.error = null;
      this.total = data.total;
      this.totalPage = Math.ceil(this.total / this.limit);
      this.currPage = this.totalPage === 0 ? 0 : this.offset / this.limit + 1;
      this.disabledPrevious = this.currPage === 1 || this.accList.length === 0;
      this.disabledNext =
        this.currPage === this.totalPage || this.accList.length === 0;
      this.isLoading = false;
    } else if (error) {
      console.log(error);
      this.error = error;
      this.totalPage = 0;
      this.currPage = 0;
      this.total = 0;
      this.accList = null;
      this.disabledPrevious = true;
      this.disabledNext = true;
    }
  }

  @wire(getAccountTypes)
  wiredAccountTypes({ error, data }) {
    console.log(data);
    if (data) {
      console.log("data: ", data);
      this.typeOptions = [
        { label: "--- Select ---", value: null },
        ...data
          .filter((item) => Boolean(item.Type))
          .map((item) => {
            return {
              label: item.Type,
              value: item.Type
            };
          })
      ];
    } else if (error) {
      console.log(error);
    }
  }

  nextPage() {
    this.isLoading = true;
    this.disabledNext = true;
    this.offset = this.offset + this.currPage * this.limit;
  }
  previousPage() {
    this.isLoading = true;
    this.disabledPrevious = true;
    this.offset = (this.currPage - 1) * this.limit - this.offset;
  }
  onChangeLimit(event) {
    this.isLoading = true;
    this.limit = parseInt(event.target.value, 10);
    this.offset = 0;
  }

  onChangeName(event) {
    this.name = event.target.value.length >= 3 ? event.target.value : "";
  }

  onChangeType(event) {
    this.type = event.target.value;
  }

  onChangeOwner(event) {
    this.ownerId = event.detail.recordId;
  }

  onChangeAnnualRevenue(event) {
    this.annualRevenue = event.detail.value;
  }

  submitFilter() {
    this.isLoading = true;
    this.offset = 0;
    this.filter = {
      name: this.name,
      type: this.type,
      annualRevenue: this.annualRevenue,
      ownerId: this.ownerId
    };
  }
}
