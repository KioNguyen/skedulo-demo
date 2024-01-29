import { LightningElement, track, wire } from 'lwc';

import getAccounts from  '@salesforce/apex/AccountController.getAccounts';
import getAnnualRevenueRange from  '@salesforce/apex/AccountController.getAnnualRevenueRange';

export default class AccountConsole extends LightningElement {
    greeting = 'World';
    changeHandler(event) {
        this.greeting = event.target.value;
    }

    get typeOptions() {
        return [
            { label: '--- Select ---', value: null },
            { label: 'Customer - Direct', value: 'Customer - Direct' },
            { label: 'Customer - Channel', value: 'Customer - Channel' },
            { label: 'Prospect', value: 'Prospect' },
        ];
    }

    @track columns = [{
            label: 'Account name',
            fieldName: 'Name',
            type: 'text',
            sortable: false
        },
        {
            label: 'Owner',
            fieldName: 'OwnerName',
            type: 'text',
            sortable: false
        },
        {
            label: 'Annual Revenue',
            fieldName: 'AnnualRevenue',
            type: 'Currency',
            sortable: false
        },
        {
            label: 'Phone',
            fieldName: 'Phone',
            type: 'phone',
            sortable: false
        },
        {
            label: 'Website',
            fieldName: 'Website',
            type: 'url',
            sortable: false
        },
        {
            label: 'Last Modified Date',
            fieldName: 'LastModifiedDate',
            type: 'text',
            sortable: false
        }
    ];

    //Filter
    @track name = "";
    @track selectedType = "";
    @track annualRevenue = 0;
    @track ownerId;
    @track minAnnualRevenue = 0;
    @track maxAnnualRevenue = 0;

    filter = {
        name: this.name,
        type: this.type,
        annualRevenue: this.annualRevenue,
        ownerId: this.ownerId
    };

    filterCriteria = {
        criteria: [
            {
                fieldPath: 'Name',
                operator: 'LIKE',
            }
        ],
    }

    matchingInfo = {
        primaryField: { fieldPath: 'Name' },
    }

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
    @wire(getAccounts, {lim: '$limit', off: '$offset', filter: '$filter'})
    wiredAccounts({
        error,
        data
    }) {
        if (data) {
            const accounts = data.items.map(item => {
                return {
                    ...item,
                    OwnerName: item.Owner.Name
                }
            });
            this.accList = accounts;
            this.error = null;
            this.total = data.total;
            this.totalPage = Math.ceil(this.total / this.limit);
            this.currPage = this.totalPage === 0 ? 0 : this.offset + 1;
            this.disabledPrevious = this.currPage === 1 || this.accList.length === 0;
            this.disabledNext = this.currPage === this.totalPage || this.accList.length === 0;
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

    @wire(getAnnualRevenueRange)
    wiredAnnualRevenueRange({
        error,
        data
    }) {
        console.log(data);
        if (data) {
            this.annualRevenueRangeErr = null;
            this.maxAnnualRevenue = data.max;
        } else if (error) {
            console.log(error);
            this.annualRevenueRangeErr = error;
        }
    }

    nextPage() {
        this.isLoading = true;
        this.disabledNext = true;
        this.offset = this.offset + 1;
    }
    previousPage() {
        this.isLoading = true;
        this.disabledPrevious = true;
        this.offset = this.offset - 1;
    }
    onChangeLimit(event) {
        this.isLoading = true;
        this.limit = parseInt(event.target.value, 10);
        this.offset = 0;
    }


    onChangeName(event){
        this.name = event.target.value;
    }

    onChangeType(event){
        this.type = event.target.value;
    }

    onChangeOwner(event){
        this.ownerId = event.detail.recordId;
    }

    onChangeAnnualRevenue(event){
        this.annualRevenue = event.detail.value
    }

    submitFilter(){
        this.isLoading = true;
        this.offset = 0;
        this.filter = {
            name: this.name,
            type: this.type,
            annualRevenue: this.annualRevenue,
            ownerId: this.ownerId
        }
    }
}