public with sharing class AccountController {
    public class AccountResult {
      @AuraEnabled
      public Integer total;
      @AuraEnabled
      public List<Account> items;
    }
    public with sharing class FilterCriteria {
        @AuraEnabled
        public String name { get; set; }
        @AuraEnabled
        public String type { get; set; }
        @AuraEnabled
        public Integer annualRevenue { get; set; }
        @AuraEnabled
        public Id ownerId { get; set; }
    }


    @AuraEnabled(cacheable=true)
    public static List<Account> getAllActiveAccounts() {
      return [SELECT Id, Name, Type, Rating, Phone, Website, AnnualRevenue  FROM Account];
    }

    @AuraEnabled(cacheable=true)
    public static AccountResult getAccounts(Integer lim, Integer off, FilterCriteria filter) {
      String sFilter = getFilterString(filter);
      String query = 'SELECT Id, Name, Type, Rating, Phone, Website, AnnualRevenue, Owner.Name, LastModifiedDate FROM Account ' + sFilter +' ORDER BY Name LIMIT :lim OFFSET :off ';
      List<Account> items =  Database.query(query);
      AccountResult result = new AccountResult();
      result.total = getTotal(sFilter);
      result.items = items;
      return result;
    }


    @AuraEnabled(cacheable=true)
    public static Integer getTotal(String filter){
      String query = 'SELECT COUNT() FROM Account ' + filter;
      Integer count =  Database.countQuery(query);
      return count;
    }

    public static String getFilterString(FilterCriteria filter) {
      Map<String, Object> fields = new Map<String, Object> {
        'Name' => filter.name,
        'Type' => filter.type,
        'AnnualRevenue' => filter.annualRevenue,
        'OwnerId' => filter.ownerId
      };
    String result = '';
    for (String fieldName : fields.keySet()) {
      if (fields.get(fieldName) == null){
        continue;
      }
      if(fields.get(fieldName) instanceOf Id && fields.get(fieldName) != null){
        result += fieldName + ' = \'' + fields.get(fieldName) + '\' AND ';
        continue;
      }
      if(fields.get(fieldName) instanceOf String && fields.get(fieldName) != ''){
        result += fieldName + ' LIKE ' + '\'%' + fields.get(fieldName) + '%\'' + ' AND ';
        continue;
      } 
      if(fields.get(fieldName) instanceOf Integer && (Integer)fields.get(fieldName) > 0){
        result += fieldName + ' > ' + fields.get(fieldName) + ' AND ';
      }
    }
    return result != '' ? 'WHERE ' + result.removeEnd('AND ') : '';
  }

  @AuraEnabled(cacheable=true)
  public static List<SObject> getAllOwner(){
    String query = 'SELECT OwnerId, Owner.Name FROM Account GROUP BY OwnerId, Owner.Name';
    List<SObject> owners  =  Database.query(query);
    return owners;
  }

  }