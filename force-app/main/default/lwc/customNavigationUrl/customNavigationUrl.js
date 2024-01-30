import { LightningElement, api } from "lwc";

import { NavigationMixin } from "lightning/navigation";

export default class CustomNavigationUrl extends NavigationMixin(
  LightningElement
) {
  @api objectApiName;
  @api actionName;
  @api recordId;
  @api label;

  navigateToAccountPage() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.recordId.toString(),
        actionName: "view"
      }
    });
  }
}
