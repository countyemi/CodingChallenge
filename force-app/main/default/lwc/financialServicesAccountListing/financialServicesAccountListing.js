import { LightningElement, wire} from 'lwc';
import getFinancialServicesAccounts from '@salesforce/apex/FInancialAccountController.getFinancialServicesAccounts';
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
import ACCOUNT_OWNER_NAME from '@salesforce/schema/Account.Owner.Name';
import PHONE from '@salesforce/schema/Account.Phone';
import WEBSITE from '@salesforce/schema/Account.Website';
import ANNUAL_REVENUE from '@salesforce/schema/Account.AnnualRevenue';

export default class FinancialServicesAccountListing extends LightningElement {
    columns = [
        {label: 'Account Name', fieldName: 'ACCOUNT_NAME', type: 'text'},
        {label: 'Account Owner Name', fieldName: 'ACCOUNT_OWNER_NAME', type: 'text'},
        {label: 'Phone', fieldName: 'PHONE', type: 'phone'},
        {label: 'Website', fieldName: 'WEBSITE', type: 'url'},
        {label: 'Annual Revenue', fieldName: 'ANNUAL_REVENUE', type: 'currency'}];

        @wire (getFinancialServicesAccounts) accounts;

        
        get errors() {
            return this.accounts.error;
                
        }
}


