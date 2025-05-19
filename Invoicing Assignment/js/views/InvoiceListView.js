
const InvoiceListView = Backbone.View.extend({
  el: "#invoice-list",

  template: _.template(`
    <h2>All Invoices</h2>
    <table border="1" cellspacing="0" cellpadding="6">
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer Name</th>
          <th>Invoice Date</th>
          <th>Total Amount (Excl. GST)</th>
        </tr>
      </thead>
      <tbody id="invoice-rows"></tbody>
    </table>

    <button id="back-home" class="btn btn-outline-secondary">
      ← Back to Customer Form
    </button>
    <div id='pagination' class="text-center mt-4"></div>
  `),

  initialize: function (options) {
    this.listenTo(this.collection, "sync", this.render);
    this.collection.fetchPage(1);  
  },

  events: {
    'click #back-home': 'goHome',
  },

  render: function () {
    this.$el.html(this.template());
    const $tbody = this.$("#invoice-rows");

    this.collection.each(invoice => {
      const fields = invoice.get("fields") || {};
      const customerName = fields["customer_name"] || "N/A";
      const invoiceDate = fields["invoice_date"] || "N/A";
      const totalAmount = fields["total_amount_excl_gst"] || "0.00";

      $tbody.append(`
      <tr>
        <td>${invoice.get("id")}</td>
        <td>${customerName}</td>
        <td>${invoiceDate}</td>
        <td>${totalAmount}</td>
      </tr>
    `);
    });
    this.renderPagination();


    return this;
  },

  renderPagination: function () {
    const total = this.collection.totalResults;
    console.log(total);
    const currentPage = this.collection.page;
    const totalPages = Math.ceil(total / this.collection.limit);
    const groupSize = 10;
    const $pagination = this.$('#pagination');
    console.log($pagination)
    $pagination.empty();
  

    if (totalPages <= 1) return;

    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const startPage = currentGroup * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    // Previous group button
    if (startPage > 1) {
      const prevBtn = $('<button class="btn btn-outline-secondary m-1">« Prev</button>');
      prevBtn.on('click', () => {
         this.collection.fetchPage(startPage - 1);
         this.$('#invoice-list').empty();

      });
      $pagination.append(prevBtn);
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      const btn = $(`<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} m-1">${i}</button>`);
      btn.on('click', () => {
        if (i !== currentPage) {
           this.collection.fetchPage(i);
           this.$('#invoice-list').empty();

        }
      });
      $pagination.append(btn);
    }

    // Next group button
    if (endPage < totalPages) {
      const nextBtn = $('<button class="btn btn-outline-secondary m-1">Next »</button>');
      nextBtn.on('click', () => {
        this.collection.fetchPage(endPage + 1);
        this.$('#invoice-list').empty();

      });
      $pagination.append(nextBtn);
    }
  },


  goHome() {
    Backbone.history.navigate('', { trigger: true });
  }

});