const InvoiceCollection = Backbone.Collection.extend({
  url: "https://shakti.orgzit.com/api/1/ozrecord/filter/tr3u6l6tl7/",
  page: 1,
  limit: 10,
  totalResults: 0,

  parse: function (response) {
    this.totalResults = response.meta?.total_count || 0;
    return response.objects || [];
  },

  fetchPage(page) {
    
    this.page = page;

    const options = {
      reset: true,
      headers: { Authorization: CONFIG.API_KEY },
      type: "PUT",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        dataform: "tr3u6l6tl7",
        limit: this.limit,
        offset: (page - 1) * this.limit
      })
    };
    return Backbone.Collection.prototype.fetch.call(this, options);
  }
});

