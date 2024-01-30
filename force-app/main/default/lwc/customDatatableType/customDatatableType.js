import LightningDatatable from "lightning/datatable";
import relativeTimeTemplate from "./relativeTimeTemplate.html";

export default class CustomDatatableType extends LightningDatatable {
  static customTypes = {
    relativeTime: {
      template: relativeTimeTemplate,
      standardCellLayout: true
    }
  };
}
