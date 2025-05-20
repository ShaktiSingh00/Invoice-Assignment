const CustomerFormView = Backbone.View.extend({
  el: "#app",

  template: _.template(`
    <div class="container mt-4">
      <h2 class="mb-4">Create Invoice</h2>
      <form id="customer-form">
        <div class="mb-3">
          <label for="customer-name" class="form-label">Customer Name</label>
          <input type="text" class="form-control" id="customer-name" required>
        </div>

        <div class="mb-3">
          <label for="invoice-date" class="form-label">Invoice Date</label>
          <input type="date" class="form-control" id="invoice-date" required>
        </div>

        <div class="mb-3">
          <label class="form-label">Invoice Items</label>
          <div id="invoice-items" class="d-flex flex-column gap-2"></div>
          <button type="button" class="btn btn-outline-primary mt-2" id="add-item">Add Invoice Item</button>
        </div>

        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-success">Submit</button>
          <button type="button" class="btn btn-secondary" id="show-invoices">Show Invoices</button>
        </div>
      </form>
    </div>
  `),

  events: {
    "submit #customer-form": "submitForm",
    "click #add-item": "addInvoiceItem",
    "click .remove-item": "removeInvoiceItem",
    "input .quantity": "updateAmount",
    "click #show-invoices": "goToInvoices"
  },

  initialize: function () {
    this.render();
  },

  render: function () {
    return this.$el.html(this.template());
  },

  addInvoiceItem: function () {
    const $removeBtn = $(`
    <div>
      <button type="button" class="btn btn-sm btn-outline-danger remove-item">❌</button>
    </div>
    `);

    const $productSelect = $(`
    <div>
      <select class="form-select product-select" style="width: 200px;"></select>
    </div>
    `);

    const $quantityInput = $(`
    <input type="number" class="form-control quantity" value="1" min="1" style="width: 80px;">
    `);

    const $unitPriceInput = $(`
    <input type="text" class="form-control unit-price" readonly placeholder="Price" style="width: 100px;">
    `);

    const $amountInput = $(`
    <input type="text" class="form-control amount" readonly placeholder="Amount" style="width: 100px;">
    `);

    const $row = $(`
    <div class="invoice-item-row d-flex align-items-center gap-2 position-relative"></div>
    `);

    $row.append($removeBtn, $productSelect, $quantityInput, $unitPriceInput, $amountInput);
    this.$("#invoice-items").append($row);
    this.initializeSelect2($productSelect.find(".product-select"));
  },

  initializeSelect2: function ($select) {
    $select.select2({
      placeholder: "Search product...",
      width: 'resolve',
      dropdownParent: $select.closest(".invoice-item-row"),
      ajax: {
        url: `https://shakti.orgzit.com/api/1/datafield/${CONFIG.ITEM_FIELD_ID}/edit_choices/`,
        type: "GET",
        dataType: "json",
        headers: { Authorization: CONFIG.API_KEY },
        data: params => ({ item_type: "", q: params.term || "" }),
        processResults: data => ({
          results: (data?.values?.choices || []).map(item => ({
            id: item.v,
            text: item.d
          }))
        }),
        cache: true
      }
    });

    $select.on("select2:select", e => {
      const selected = e.params.data;
      const $row = $select.closest(".invoice-item-row");

      $.ajax({
        url: `https://shakti.orgzit.com/api/1/field_attribute_map/${CONFIG.FK_FIELD_ID}/default_fk_value/?record=${selected.id}`,
        headers: { Authorization: CONFIG.API_KEY },
        success: function (res) {
          const price = parseFloat(res.value) || 0;
          const qty = parseFloat($row.find(".quantity").val()) || 1;
          $row.find(".unit-price").val(price.toFixed(2));
          $row.find(".amount").val((price * qty).toFixed(2));
        },
        error: function () {
          $row.find(".unit-price, .amount").val("");
        }
      });
    });
  },

  updateAmount: function (e) {
    const $row = $(e.currentTarget).closest(".invoice-item-row");
    const qty = parseFloat($row.find(".quantity").val()) || 1;
    const price = parseFloat($row.find(".unit-price").val()) || 0;
    $row.find(".amount").val((qty * price).toFixed(2));
  },

  submitForm: function (e) {
    e.preventDefault();

    const name = this.$("#customer-name").val().trim();
    const date = this.$("#invoice-date").val().trim();

    if (!name || !date) {
      alert("Please fill in all fields.");
      return;
    }

    const customerModel = new CustomerModel();
    customerModel.set({ customer_name: name, invoice_date: date });

    customerModel.save(null, {
      success: (model, response) => {
        const invoiceId = response.history?.[0]?.recordid;
        if (!invoiceId) {
          alert("Could not retrieve invoice ID.");
          return;
        }

        this.$(".invoice-item-row").each(function () {
          const $row = $(this);
          const productData = $row.find(".product-select").select2("data")[0];
          const qty = parseFloat($row.find(".quantity").val()) || 1;
          const price = parseFloat($row.find(".unit-price").val()) || 0;

          if (!productData || !qty || !price) return;

          const payload = {
            dataform_id: "pg7khpfrx7",
            fields: {
              item: productData.text,
              quantity: qty,
              unit_price: price,
            },
            dbvalues: {
              invoice: String(invoiceId),
              item: productData.id
            },
            action_type: ""
          };

          $.ajax({
            url: "https://shakti.orgzit.com/api/1/ozrecord/",
            method: "POST",
            headers: {
              Authorization: CONFIG.API_KEY,
              "Content-Type": "application/json",
            },
            data: JSON.stringify(payload)
          });
        });

        alert("Invoice submitted successfully!");
      },
      error: () => {
        alert("Error saving invoice.");
      }
    });
  },

  removeInvoiceItem: function (e) {
    $(e.currentTarget).closest(".invoice-item-row").remove();
  },

  goToInvoices: function () {
    Backbone.history.navigate("invoices", { trigger: true });
  }
});
