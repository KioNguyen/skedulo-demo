import LightningDatatable from "lightning/datatable";
import objectUrlTemplate from "./objectUrlTemplate.html";
import relativeTimeTemplate from "./relativeTimeTemplate.html";

export default class CustomDatatableType extends LightningDatatable {
  static customTypes = {
    relativeTime: {
      template: relativeTimeTemplate,
      standardCellLayout: true
    },
    objectUrl: {
      template: objectUrlTemplate,
      standardCellLayout: true,
      typeAttributes: ["label", "objectType", "action"]
    }
  };
}
