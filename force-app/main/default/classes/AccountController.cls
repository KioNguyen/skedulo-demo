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
    public Decimal annualRevenue { get; set; }
    @AuraEnabled
    public Id ownerId { get; set; }
  }

  @AuraEnabled(cacheable=true)
  public static List<Account> getAllActiveAccounts() {
    return [
      SELECT Id, Name, Type, Rating, Phone, Website, AnnualRevenue
      FROM Account
    ];
  }

  @AuraEnabled(cacheable=true)
  public static AccountResult getAccounts(
    Integer lim,
    Integer off,
    FilterCriteria filter
  ) {
    String sFilter = '';
    String sFilterName = filter.name != null ? '%' + filter.name + '%' : '';
    String sFilterType = filter.type;
    Decimal sFilterAnnualRevenue = filter.annualRevenue;
    String sFilterOwnerId = (String) filter.ownerId;
    // Generate dynamic filter string
    Map<String, String> filters = new Map<String, String>{
      'Owner.Name LIKE :sFilterName OR ' => sFilterName,
      'Name LIKE :sFilterName AND ' => sFilterName,
      'Type = :sFilterType AND ' => sFilterType,
      'AnnualRevenue >= :sFilterAnnualRevenue AND ' => String.valueOf(
        sFilterAnnualRevenue
      ),
      'OwnerId = :sFilterOwnerId AND ' => sFilterOwnerId
    };
    for (String condition : filters.keySet()) {
      String value = filters.get(condition);
      if (
        value != null &&
        value != '' &&
        value != '%%' &&
        (condition.contains('AnnualRevenue')
          ? Decimal.valueOf(value) > 0
          : true)
      ) {
        sFilter += condition;
      }
    }
    sFilter = sFilter != '' ? 'WHERE ' + sFilter.removeEnd('AND ') : '';

    String query =
      'SELECT Id, Name, Type, Rating, Phone, Website, AnnualRevenue, Owner.Name, LastModifiedDate FROM Account ' +
      sFilter +
      ' ORDER BY Name LIMIT :lim OFFSET :off ';
    List<Account> items = Database.query(query);
    AccountResult result = new AccountResult();
    // Get total items base on filter
    String totalQuery = 'SELECT COUNT() FROM Account ' + sFilter;
    result.total = Database.countQuery(totalQuery);
    result.items = items;
    return result;
  }

  @AuraEnabled(cacheable=true)
  public static SObject[] getAccountTypes() {
    String query = 'SELECT Type FROM Account GROUP BY Type';
    SObject[] count = Database.query(query);
    return count;
  }
}
