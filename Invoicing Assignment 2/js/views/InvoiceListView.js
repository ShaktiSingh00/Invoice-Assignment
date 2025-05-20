// const InvoiceListView = Backbone.View.extend({
//   el: "#invoice-list",

//   template: _.template(`
//     <h2>All Invoices</h2>
//     <table class="table table-bordered table-striped">
//       <thead class="table-dark">
//         <tr>
//           <th>ID</th>
//           <th>ID1</th>
//           <th>Customer Name</th>
//           <th>Invoice Date</th>
//           <th>Total Amount (Excl. GST)</th>
//           <th>Invoice Doc</th>

//         </tr>
//       </thead>
//       <tbody id="invoice-rows"></tbody>
//     </table>
//     <div id="pagination" class="d-flex flex-wrap gap-1 mt-3"></div>
//     <button id="back-home" class="btn btn-outline-secondary">← Back to Customer Form</button>
//   `),

//   initialize(options) {
//     this.collection = options.collection;
//     this.listenTo(this.collection, "reset", this.render);
//     this.collection.fetchPage(1);
//   },

//   events: {
//     "click #back-home": "goHome",
//     "click .page-link": "switchPage"
//   },

//   render() {
//     this.$el.html(this.template());
//     const $tbody = this.$("#invoice-rows");

//     this.collection.each(invoice => {
//       const fields = invoice.get("fields") || {};
//       const dbvalues = invoice.get("dbvalues") || {};

//       $tbody.append(`
//         <tr>
//           <td>${invoice.get("id")}</td>
//           <td>${fields.id}</td>
//           <td>${fields.customer_name || "N/A"}</td>
//           <td>${fields.invoice_date || "N/A"}</td>
//           <td>${fields.total_amount_excl_gst || "0.00"}</td>
//           <td>${fields.invoice_file ? `<a href="${dbvalues.invoice_file}" target="_blank">Download</a>`: " "}</td> 
//         </tr>
//       `);
//     });

//     this.renderPagination();
//     return this;
//   },

//   renderPagination() {
//     const total = this.collection.totalResults;
//     const perPage = this.collection.limit;
//     const curr = this.collection.page;
//     const totalPages = Math.ceil(total / perPage);

//     if (totalPages <= 1) return;

//     const $pag = this.$("#pagination").empty();
//     const groupSize = 10;
//     const groupIdx = Math.floor((curr - 1) / groupSize);
//     const start = groupIdx * groupSize + 1;
//     const end = Math.min(start + groupSize - 1, totalPages);

//     if (start > 1) {
//       $pag.append(this.pageBtn("« Prev", start - 1));
//     }

//     for (let p = start; p <= end; p++) {
//       $pag.append(this.pageBtn(p, p, p === curr));
//     }

//     if (end < totalPages) {
//       $pag.append(this.pageBtn("Next »", end + 1));
//     }
//   },

//   pageBtn(label, page, active = false) {
//     return $(`
//       <button class="page-link btn btn-sm ${active ? "btn-primary" : "btn-outline-primary"} m-1"
//               data-page="${page}">${label}</button>
//     `);
//   },

//   switchPage(e) {
//     e.preventDefault();
//     const page = parseInt($(e.currentTarget).data("page"), 10);
//     if (page !== this.collection.page) {
//       this.collection.fetchPage(page);
//     }
//   },

//   goHome() {
//     Backbone.history.navigate('', { trigger: true });
//   }
// });


const InvoiceListView = Backbone.View.extend({
  el: "#invoice-list",

  template: _.template($("#invoice-list-template").html()),
  rowTemplate: _.template($("#invoice-row-template").html()),

  initialize(options) {
    this.collection = options.collection;
    this.listenTo(this.collection, "reset", this.render);
    this.collection.fetchPage(1); // load first page
  },

  events: {
    "click #back-home": "goHome",
    "click .page-link": "switchPage"
  },

  render() {
    this.$el.html(this.template());
    const $tbody = this.$("#invoice-rows");

    this.collection.each(invoice => {
      const rowHtml = this.rowTemplate({
        id: invoice.get("id"),
        fields: invoice.get("fields") || {},
        dbvalues: invoice.get("dbvalues") || {}
      });
      $tbody.append(rowHtml);
    });

    this.renderPagination();
    return this;
  },

  renderPagination() {
    const total = this.collection.totalResults;
    const perPage = this.collection.limit;
    const curr = this.collection.page;
    const totalPages = Math.ceil(total / perPage);

    if (totalPages <= 1) return;

    const $pag = this.$("#pagination").empty();
    const groupSize = 10;
    const groupIdx = Math.floor((curr - 1) / groupSize);
    const start = groupIdx * groupSize + 1;
    const end = Math.min(start + groupSize - 1, totalPages);

    if (start > 1) {
      $pag.append(this.pageBtn("« Prev", start - 1));
    }

    for (let p = start; p <= end; p++) {
      $pag.append(this.pageBtn(p, p, p === curr));
    }

    if (end < totalPages) {
      $pag.append(this.pageBtn("Next »", end + 1));
    }
  },

  pageBtn(label, page, active = false) {
    return $(`
      <button class="page-link btn btn-sm ${active ? "btn-primary" : "btn-outline-primary"} m-1"
              data-page="${page}">${label}</button>
    `);
  },

  switchPage(e) {
    e.preventDefault();
    const page = parseInt($(e.currentTarget).data("page"), 10);
    if (page !== this.collection.page) {
      this.collection.fetchPage(page);
    }
  },

  goHome() {
    Backbone.history.navigate('', { trigger: true });
  }
});
