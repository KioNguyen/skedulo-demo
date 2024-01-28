public class SyncExternalUserBatch implements Database.Batchable<sObject>, Database.AllowsCallouts {
    public Database.QueryLocator start(Database.BatchableContext BC) {
        String query = 'SELECT ExternalId__c FROM Account';
        return Database.getQueryLocator(query);
    }

    public void execute(Database.BatchableContext BC, List<Account> scope) {
        System.debug('Batch executing!!!');
        try{
            List<Account> account2Save = new List<Account>();
            // Callout to external system to get the accounts
            String endpoint = 'https://8a3dd997-2434-4a68-bfd8-65dee93f5024.mock.pstmn.io/getAccounts';
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setTimeout(5000);
            HttpResponse response = http.send(request);
            

            if(response.getStatusCode() == 200){
                // Parse the JSON response
                List<Object> extAccounts = (List<Object>) JSON.deserializeUntyped(response.getBody());
                
                for (Object account : extAccounts) {
                    System.debug(account);
                    Map<String,  Object> empRecord = (Map<String, Object>)account;
                    Account extAccount = new Account(
                        Name = (String)empRecord.get('Name'),
                        Type = (String)empRecord.get('Type'),
                        BillingStreet = (String)empRecord.get('BillingStreet'),
                        BillingCity = (String)empRecord.get('BillingCity'),
                        BillingState = (String)empRecord.get('BillingState'),
                        BillingPostalCode = (String)empRecord.get('BillingPostalCode'),
                        Phone = (String)empRecord.get('Phone'),
                        Website = (String)empRecord.get('Website'),
                        ExternalId__c = (String)empRecord.get('ExternalId')
                    );
                    System.debug(extAccount);
                    account2Save.add(extAccount);
                }
            }
            // Upsert the accounts based on the ExternalId field
            Database.UpsertResult[] results = Database.upsert(account2Save, Account.fields.ExternalId__c, false);

        }catch(Exception e){
            System.debug(e);
        }
    }

    public void finish(Database.BatchableContext BC) {
        System.debug('Finished External User Clone!!!');
    }

}