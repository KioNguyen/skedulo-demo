trigger UpdateAccountField on Account (before update) {
    for(Account a : Trigger.new){
        System.debug('Account: ' + a.Id + ' ' + a.Name + ' ' + a.UpdateCount__c);
        Account oldAccount = Trigger.oldMap.get(a.Id);
        if(a != oldAccount){
            a.UpdateCount__c = a.UpdateCount__c == null ? 1 : a.UpdateCount__c + 1;
        }
    }
}