import { LightningElement, track, wire } from 'lwc';

import getAccounts from  '@salesforce/apex/AccountController.getAccounts';
import getAllOwner from  '@salesforce/apex/AccountController.getAllOwner';

export default class AccountConsole extends LightningElement {
    greeting = 'World';
    changeHandler(event) {
        this.greeting = event.target.value;
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

    filter = {
        name: this.name,
        type: this.type,
        annualRevenue: this.annualRevenue,
        ownerId: this.ownerId
    };


    //Pagination
    @track error;
    @track accList;
    @track total = 0;
    @track totalPage = 0;
    @track currPage = 0;
    @track limit = 5;
    @track offset = 0;
    @track isLoading = false;
    @track disabledPrevious = true;
    @track disabledNext = false;
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
            accounts.unshift({
                value: null,
                label: '--- Select ---'
            })
            this.accList = accounts;
            this.total = data.total;
            this.totalPage = Math.ceil(this.total / this.limit);
            this.currPage = this.offset + 1;
            this.disabledPrevious = this.currPage === 1
            this.disabledNext = this.currPage === this.totalPage
            this.isLoading = false;
        } else if (error) {
            this.error = error;
        }
    }


    //Get All Owner
    @track ownerOptions = [];
    @wire(getAllOwner)
    wiredOwners({
        error,
        data
    }) {
        if (data) {
            console.log('data', data);
            const owners = data.map(item => {
                return {
                    label: item.Name,
                    value: item.OwnerId
                }
            });
            owners.push({
                value: null,
                label: '--- Select ---'
            })
            this.ownerOptions = owners;
        } else if (error) {
            console.log('error', error);
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


    get typeOptions() {
        return [
            { label: '--- Select ---', value: null },
            { label: 'Customer - Direct', value: 'Customer - Direct' },
            { label: 'Customer - Channel', value: 'Customer - Channel' },
            { label: 'Prospect', value: 'Prospect' },
        ];
    }


    handleNameChange(event){
        console.log('handleNameChange', event.target.value);
        this.name = event.target.value;
    }

    handleSelectType(event){
        this.type = event.target.value;
        console.log('handleSelectType', event.target.value);
    }

    handleSelectOwner(event){
        this.ownerId = event.target.value;
        console.log('handleSelectType', event.target.value);
    }

    handleAnnualRevenueChange(event){
        this.annualRevenue = event.detail.value
    }

    handleFilter(){
        this.isLoading = true;
        this.filter = {
            name: this.name,
            type: this.type,
            annualRevenue: this.annualRevenue,
            ownerId: this.ownerId
        }
    }

    
}