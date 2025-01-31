// financialServicesAccountList.js
import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getFinancialServicesAccounts from '@salesforce/apex/FinancialAccountController.getFinancialServicesAccounts';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import OWNER_FIELD from '@salesforce/schema/Account.OwnerId';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';
import REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';

const COLUMNS = [
    { 
        label: 'Account Name', 
        fieldName: 'Name', 
        type: 'button', 
        typeAttributes: {
            label: { fieldName: 'Name' },
            variant: 'base',
            name: 'view_details'
        },
        sortable: true,
        cellAttributes: { alignment: 'left' }
    },
    { label: 'Account Owner', fieldName: 'OwnerName', type: 'text', sortable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
    { label: 'Website', fieldName: 'Website', type: 'url', editable: true },
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency', editable: true }
];

export default class FinancialServicesAccountListing extends NavigationMixin(LightningElement) {
    @track accounts = [];
    @track filteredAccounts = [];
    @track sortBy;
    @track sortDirection;
    @track searchTerm = '';
    @track columns = COLUMNS;
    @track draftValues = [];
    wiredAccountsResult;

    @wire(getFinancialServicesAccounts)
    wiredAccounts(result) {
        this.wiredAccountsResult = result;
        if (result.data) {
            this.accounts = result.data.map(account => ({
                ...account,
                OwnerName: account.Owner?.Name
            }));
            this.filterAccounts();
        }
    }

    handleSort(event) {
        const { fieldName: sortBy, sortDirection } = event.detail;
        this.sortBy = sortBy === 'OwnerName' ? 'Owner.Name' : sortBy;
        this.sortDirection = sortDirection;
        this.sortData(sortBy, sortDirection);
    }

    sortData(sortBy, sortDirection) {
        const reverse = sortDirection === 'asc' ? 1 : -1;
        const sortedData = [...this.filteredAccounts].sort((a, b) => {
            const valueA = sortBy === 'Owner.Name' ? a.Owner?.Name : a[sortBy];
            const valueB = sortBy === 'Owner.Name' ? b.Owner?.Name : b[sortBy];
            return reverse * ((valueA > valueB) - (valueB > valueA));
        });
        this.filteredAccounts = sortedData;
    }

    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase();
        this.filterAccounts();
    }

    filterAccounts() {
        this.filteredAccounts = this.accounts.filter(account =>
            account.Name.toLowerCase().includes(this.searchTerm)
        );
        if (this.sortBy && this.sortDirection) {
            this.sortData(this.sortBy, this.sortDirection);
        }
    }

    handleRowAction(event) {
        if (event.detail.action.name === 'view_details') {
            const accountId = event.detail.row.Id;
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: accountId,
                    actionName: 'view'
                },
                target: '_blank'
            });
        }
    }

    handleSave(event) {
        const records = event.detail.draftValues.map(draft => {
            const fields = { ...draft };
            return { fields };
        });

        const promises = records.map(record => updateRecord(record));
        Promise.all(promises).then(() => {
            this.draftValues = [];
            return refreshApex(this.wiredAccountsResult);
        }).catch(error => {
            console.error('Error updating records:', error);
        });
    }
}