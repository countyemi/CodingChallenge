public with sharing class FInancialAccountController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getFinancialServicesAccounts() {
        return [SELECT Id, Name, Owner.Name, Phone, Website, AnnualRevenue FROM Account  WHERE Type = 'Financial Services'];


    }
}