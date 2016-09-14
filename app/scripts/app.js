// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'chartjs',
  'vendor/consoleclass/consoleclass',
  'text!../templates/navigation.html',
  'text!../templates/layout.html',
  'text!../templates/cta.html',
  'text!../templates/footer.html',
  'text!../templates/about.html',
  'text!../templates/team.html',
  'views/team_list',
  'views/faq_list',
  'views/growth',
  'views/growth_data',
  // 'views/transactions/2016/07',
  // 'views/transactions/2016/08',
  'views/finance_data',
  // 'text!../templates/growth.html',
], 
function($, _, Backbone, Marionette,navigation,layout,cta_content,footer_content,about_content,team_content,team_list,faq_list,growth_content,growth_data,finance_data){
  console.log('doing appjs');
  cc('consoleclass working');

  
  // var faqs = require('views/faqs');  
  

  var navigation = require('text!../templates/navigation.html'); 
  var layout = require('text!../templates/layout.html');  
  var cta_content = require('text!../templates/cta.html');  
  var footer_content = require('text!../templates/footer.html'); 
  
  var about_content = require('text!../templates/about.html'); 
  var team_content = require('text!../templates/team.html'); 
  // var growth_content = require('text!../templates/growth.html'); 
  
  var team_list = require('views/team_list'); 
  var faq_list = require('views/faq_list'); 
  var growth_content = require('views/growth'); 
  var growth_data = require('views/growth_data'); 
   
  // Define a new app
  window.App = new Marionette.Application();

  // Define routes
  App.Router = Marionette.AppRouter.extend({
      appRoutes: {
          
          'about':      'about',
          'team':       'team',
          'growth':     'growth',
          'faqs':       'faqs',
          '*path':      'team',
          '':           'team',
      }
  });

  // Handle routes
  App.Controller = Marionette.Controller.extend({
      about: function() {
          var view = new App.AboutView();
          App.mainRegion.show(view);
      },
      team: function() {
          var view = new App.TeamlistView();
          App.mainRegion.show(view);
      },
      growth: function() {
          var view = new App.GrowthView();
          App.mainRegion.show(view);
      },
      faqs: function() {
          var view = new App.FaqlistView();
          App.mainRegion.show(view);
      },
      index: function() {
          var view = new App.IndexView();
          App.mainRegion.show(view);
      },
  });

  // Add targeted regions
  App.addRegions({
      ctaRegion:            "#cta-region",
      headerRegion:         "#header-region",
      footerRegion:         "#footer-region",
      mainRegion:           "#main-region #top",
      ctaRegion:            "#cta-region",
      faqsRegion:           "#faqs-region"
  });

// Route based views

  App.AboutView = Marionette.ItemView.extend({
      tagName: 'div',
      template: about_content,
      onBeforeShow: function(){
        $('body').removeClass();
        $('body').addClass('view-about');
        $('#team_list').hide();
        $('#faq_list').hide();
      },
      onShow: function(){
        console.log('AboutView shown')
      }
  });

  App.TeamlistView = Marionette.ItemView.extend({
      tagName: 'div',
      template: team_list,
      onBeforeShow: function(){
        $('body').removeClass();
        $('body').addClass('view-team');
        $('#team_list').show();
        $('#faq_list').hide();
      },
      onShow: function(){
        console.log('Teamlist shown')
      }
  });


  App.GrowthView = Marionette.ItemView.extend({
      tagName: 'div',
      template: growth_content,
      onBeforeShow: function(){
        $('body').removeClass();
        $('body').addClass('view-growth');
        $('#team_list').hide();
        $('#faq_list').hide();
      },
      onShow: function(){
        console.log('GrowthView shown');
        var content_div = $('#center_content');
        // $(content_div).removeClass();
        
        // Chart Options
        var custom_chart_options = {
          animation: false,
          stacked: true,
          scaleLabel: function(label){return label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");}
        };

       
        var Grouped_categories = [
          {
            "parent_category" : "Eating Out",
            "child_category" : [
              {
                "category" : "Food & Dining"
              },
              {
                "category" : "Fast Food"
              },
              {
                "category" : "Restaurants"
              },
            ]
          },
          {
            "parent_category" : "Entertainment",
            "child_category" : [
              {
                "category" : "Alcohol & Bars"
              },
              {
                "category" : "Coffee Shops"
              },
              {
                "category" : "Movies & DVDs"
              },
              {
                "category" : "Sporting Goods"
              },
              {
                "category" : "Books"
              },
              {
                "category" : "Music"
              },
              {
                "category" : "Shopping"
              },
              {
                "category" : "Gift"
              },
              {
                "category" : "Amusement"
              },
              {
                "category" : "Entertainment"
              },
              {
                "category" : "Arts"
              }
            ]
          }
          ];
        var Grouped_categories_size = _.size(Grouped_categories);
        Grouped_categories_size--;

        // 
        var Yearly_Totals = [];
        var Yearly_Totals_size = _.size(Yearly_Totals);
        Yearly_Totals_size--;

        // Get Data from Mint Exports
        var Categories_2016 = [];
        var Data_By_Month_2016 = [];
        var Subcategory_Data_2016 = [];

        var month_label = null;
        var current_month_count = 8;
        var last_month_count = 9;


        for (m = 1; m < last_month_count; m++) { 


          // Initialize Arrays 
          var Category_Data = [];
          var chart_categories = [];
          var chart_totals = [];

          // Add Readable Month Label
          var month_label = getMonthLabel(m);

          // CATEGORIES

          // Get Data from Mint Exports
          var Categories = _.pluck(data_2016[m], 'Category');
          // Only Load Category Label Once
          var All_Categories = _.uniq(Categories);
          var category_count = _.size(All_Categories);
          cc('# of Unique Categories in 2016 Month['+month_label+']: '+category_count, 'highlight');
          var Category_Flag = category_count-1;
          cc('Category_Flag: '+Category_Flag,'highlight',true);
          

          // Iterate Through categories, add total spent per category
          for (i = 0; i < category_count; i++) { 
            var current_category = All_Categories[i];
            var total = totalSpent(current_category, data_2016[m]);  
            cc('Category['+i+']: '+current_category +' $'+total,'success',true);

            var data = [];
                 
            data = [{
                "category" : current_category,
                "total" : total
              }];  
            Category_Data = Category_Data.concat(data);  
            // }             
            
            var Category_Data_Size = _.size(Category_Data);

            // When all category total spending complete, then show on Chart
            if (i == Category_Flag) {
              // console.log(Category_Data);

              // Data_By_Month_2016 = Data_By_Month_2016.concat(Category_Data);
              var month_data = [];
                   
              month_data = [{
                  "month" : m,
                  "data" : Category_Data
                }];  
              Data_By_Month_2016 = Data_By_Month_2016.concat(month_data); 

              // Remove Income categories
              Category_Data = removeIncomeCategories(Category_Data);
              
              // Build Dataset
              Category_Data = _.sortBy(Category_Data,"category");
              
              // groupSubCategories(Category_Data,category_count);

              chart_categories = _.pluck(Category_Data, 'category');
              chart_totals = _.pluck(Category_Data, 'total');

              // Build Chart
              var ctx = document.getElementById("chart-"+month_label);
              var myChart = new Chart(ctx, {
                  type: 'bar',
                  data: {
                      labels: chart_categories,
                      datasets: [{
                            label: month_label+' Spending Category',
                            data: chart_totals,
                        }
                      ]
                  },
                  options: custom_chart_options
              });

              // Add uniq categories to All Categories
              Categories_2016 = Categories_2016.concat(chart_categories);
              // console.log(Categories_2016);
            }
          } // end for loop for this month categories
          if (m == current_month_count) {
            
            Categories_2016 = _.uniq(Categories_2016);
            var Categories_2016_size = _.size(Categories_2016);
            
            cc('Nubmer of Categories_2016: '+Categories_2016_size,'highlight');
            cc('unique Categories_2016: ','highlight');
            // console.log(Categories_2016);
            
            $('p.copy').append('<ul id="category_list"></ul>')
            for (c = 0; c < Categories_2016_size; c++) { 
              // console.log(Categories_2016[c]);
              $('#category_list').append('<li>'+Categories_2016[c]+'</li>');
            }
            
            cc('Data_By_Month_2016: ','done');
            for (m = 0; m < current_month_count; m++) { 
              var getData = Data_By_Month_2016[m]["data"];
              var totalCategoriesThisMonth = Data_By_Month_2016[m]["data"].length;
              cc('totalCategoriesThisMonth['+m+']: '+totalCategoriesThisMonth,'success');
              var totalCategoriesThisMonth_flag = totalCategoriesThisMonth--;

              var year_month_data = [];
              var month_data = []
              
              for (c = 0; c < totalCategoriesThisMonth_flag; c++) {
                // cc('Found Category in Month['+m+']: '+Data_By_Month_2016[m]["data"][c]["category"]+ ' total: '+Data_By_Month_2016[m]["data"][c]["total"],'done');
                var this_month_data = [
                  {
                    category : Data_By_Month_2016[m]["data"][c]["category"],
                    total : Data_By_Month_2016[m]["data"][c]["total"]
                  }
                ];
                month_data = month_data.concat(this_month_data);
                // console.log(month_data);
                if (c == totalCategoriesThisMonth) {
                  var month_count = m+1;
                  var this_month_data = [
                    {
                      month : getMonthLabel(month_count),
                      data : month_data
                    }
                  ];
                  Yearly_Totals = Yearly_Totals.concat(this_month_data);
                  var all_months_done = current_month_count-1;
                  if (m == all_months_done) {
                    cc('TOTAL Grouped by Month','fatal')
                    console.log(Yearly_Totals);  
                    console.log(Yearly_Totals.length);  
                    
                    containsCategory(Yearly_Totals,Yearly_Totals.length, 'Web Services');
                  }
                }
              }
            }
          }
        } // end loo through all months


        function containsCategory(Yearly_Totals,size,find_category){

          cc('containsCategory['+find_category+'] total months['+size+']','run');

          for (x = 0; x < size; x++) {
            var category_count = Yearly_Totals[x]["data"].length;
            for (y = 0; y < category_count; y++) {
              var current = Yearly_Totals[x]["data"];
              cc('Month['+Yearly_Totals[x]["month"]+'] Category['+Yearly_Totals[x]["data"][y]["category"]+'] Total['+Yearly_Totals[x]["data"][y]["total"]+']');
              if (Yearly_Totals[x]["data"][y]["category"] == find_category) {
                cc('category MATCHED','success');
              }
            }
          }
        }

        function groupSubCategories(Category_Data,category_count) {
          cc('groupSubCategories','run');
          // console.log(Category_Data);
          // cc('Category_Data[0]["data"][0]["category"] '+Category_Data[0]["data"][0]["category"],'info')
          var size = _.size(Category_Data);
          var loop_end = size;
          // cc('size'+size,'highlight')
          // cc('Categories_2016_size: '+Categories_2016_size,'done');
          
          var st = 0;
          var Entertainment_Total = 0;
          var Eating_Out_Total = 0;

          for (c = 0; c < size; c++) {
            
          }
          cc('post','info')
          
        }

        function removeIncomeCategories(data){
          // Remove Income from Spending Categories
          var data = $.grep(data, function(e){ 
             return e.category != 'Income'; 
          });
          // Remove Transfers from Spending Categories
          var data = $.grep(data, function(e){ 
             return e.category != 'Transfer to PFCU'; 
          });
          // Remove Payments to Credit Accounts from Spending Categories
          var data = $.grep(data, function(e){ 
             return e.category != 'Credit Card Payment'; 
          });
          return data;
        }

        function totalSpent(category,period){
          var category_data = _.where(period, {Category: category});        
          var category_amounts = _.pluck(category_data,'Amount');
          var category_sum = _.reduce(category_amounts, function(memo, num){ return memo + num; }, 0); 
          var category_total_spent = parseFloat(category_sum).toFixed(2);
          cc('Category Total Spent('+category+'): $'+category_total_spent,'success',true);
          return category_total_spent;
        }

        function getMonthLabel(m) {
          switch(m) {
            case 1:
                month_label = 'January'
                break;
            case 2:
                month_label = 'February'
                break;
            case 3:
                month_label = 'March'
                break;
            case 4:
                month_label = 'April'
                break;
            case 5:
                month_label = 'May'
                break;
            case 6:
                month_label = 'June'
                break;
            case 7:
                month_label = 'July'
                break;
            case 8:
                month_label = 'August'
                break;
            case 9:
                month_label = 'September'
                break;
            case 10:
                month_label = 'October'
                break;
            case 11:
                month_label = 'November'
                break;
            case 12:
                month_label = 'December'
                break;
            default:
                month_label = 'error'
          }
          return month_label
        }

        // CHART
        var ctx = document.getElementById("growth_chart");
        var custom_options = {
            animation: false,
            stacked: true,
            scaleLabel: function(label){return label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");}
        };
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                      label: 'Number of Users',
                      data: number_of_users,
                      backgroundColor: [
                          '#4E9FD4',
                          '#4E9FD4',
                          '#4E9FD4',
                          '#4E9FD4',
                          '#4E9FD4',
                      ],
                      borderColor: [
                          // 'rgba(255,99,132,1)',
                      ],
                      borderWidth: 0
                  },
                  {
                      label: 'Annual Revenue',
                      data: annual_revenue,
                      backgroundColor: [
                          '#C03441',
                          '#C03441',
                          '#C03441',
                          '#C03441',
                          '#C03441',
                      ],
                      borderColor: [
                          // 'rgba(255,99,132,1)',
                      ],
                      borderWidth: 0
                  }
                ]
            },
            options: custom_options
        });

        // CHART
        var ctx = document.getElementById("chart_financial_summary");

        var custom_options = {
            animation: false,
            stacked: true,
            scaleLabel: function(label){return label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");}
        };

        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: three_years,
                datasets: [{
                      label: 'Sales',
                      data: sales,
                      backgroundColor: [
                          '#4E9FD4',
                          '#4E9FD4',
                          '#4E9FD4',
                      ],
                      borderColor: [
                          // 'rgba(255,99,132,1)',
                      ],
                      borderWidth: 0
                  },
                  {
                      label: 'Margins',
                      data: margins,
                      backgroundColor: [
                          '#C03441',
                          '#C03441',
                          '#C03441',
                      ],
                      borderColor: [
                          // 'rgba(255,99,132,1)',
                      ],
                      borderWidth: 0
                  },
                  {
                      label: 'Profits',
                      data: profits,
                      backgroundColor: [
                          '#8A6E91',
                          '#8A6E91',
                          '#8A6E91',
                      ],
                      borderColor: [
                          // 'rgba(255,99,132,1)',
                      ],
                      borderWidth: 0
                  }
                ]
            },
            options: custom_options
        });
        

      } // end onShow

      // Combined Chart
      //Chart Data
  
    
  }); // end GrowthView

  App.FaqlistView = Marionette.ItemView.extend({
      tagName: 'div',
      template: faq_list,
      onBeforeShow: function(){
        $('body').removeClass();
        $('body').addClass('view-faq');
        $('#team_list').hide();
        $('#faq_list').show();
      },
      onShow: function(){
        console.log('FaqlistView shown')
      }
  });

  App.FaqsView = Marionette.ItemView.extend({
      tagName: 'h1',
      template: _.template('<span class="headline-big">FAQ View</span>'),
      onShow: function(){
        console.log('FaqsView content shown')
      }
  });

  App.IndexView = Marionette.ItemView.extend({
    tagName: 'h1',
    template: _.template('<span class="headline-big">Index View</span>'),
    onShow: function(){
      console.log('default IndexView shown')
    }
  });

// PAGE LAYOUTS

  App.HeaderView = Marionette.LayoutView.extend({
      tagName: 'ul',
      template: navigation
  });

  App.CtaView = Marionette.LayoutView.extend({
      tagName: 'div',
      template: cta_content
  });

  App.FooterView = Marionette.LayoutView.extend({
      tagName: 'div',
      template: footer_content
  });

  App.MainView = Marionette.LayoutView.extend({
      tagName: 'div',
      template: layout,
      onShow: function(){
        console.log('MainView content shown')
      }
  });


// RUN APP

  var AppView = Backbone.View.extend({
    initialize: function() {
      // Start the router and handle views
      App.router = new App.Router({
        controller: new App.Controller()
      });

      // Add base layout elements upon initialize
      var header = new App.HeaderView();
      var cta = new App.CtaView();
      // var footer = new App.FooterView();
      
      App.headerRegion.show(header);
      App.ctaRegion.show(cta);
      // App.footerRegion.show(footer);

      Backbone.history.start();
      console.log( 'app.js says: Backbone history has started!' );

    }
  });

  return AppView;
});
