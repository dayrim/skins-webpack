// Feeds

(function() {

	var feeds = $('#feeds'),
		feedsLoading = false,
		feedsLoaded = false,
		feedsArray = [],
		feedCategoriesArray = [],
		itemsPerPattern = 0,
		feedItems,
		feedCategories = $('.category-selector', feeds),
		feedItemsContainer = $('.feed-items', feeds),
		feedControls = $('.feed-controls', feeds);

	function calculateFeedsPattern(){
		var counter = 0;

		if (windowWidth < 450) {
			counter = 2;
		} else if (windowWidth >= 450 && windowWidth < 768) {
			counter = 4;
		} else if (windowWidth >= 768 && windowWidth < 980) {
			counter = 6;
		} else if (windowWidth >= 980 && windowWidth < 1440) {
			counter = 5;
		} else if (windowWidth >= 1440 && windowWidth < 1800) {
			counter = 9;
		} else if (windowWidth >= 1800) {
			counter = 10;
		}

		return counter;
	}

	function rebuildFeeds () {
		var counter = calculateFeedsPattern();

		if (counter != itemsPerPattern) {
			itemsPerPattern = counter;

			removeFeeds();
			feeds.addClass('loading');
			feedCategories.children().eq(0).trigger('click');
			buildFeeds();
		}
	}

	function removeFeeds (){
		feedItemsContainer.empty();
		feedControls.empty();
	}

	function buildCategories(){
		if (feedCategoriesArray.length <=1 ) return;

		feedCategoriesArray = feedCategoriesArray.filter(function(e){return e});

		feedCategoriesArray.unshift({
			name: 'All',
			type: 'all'
		});

		$.each(feedCategoriesArray, function (index, entry) {
			$('<button />', {
				class: 'button ' + entry.type +'-button'+ (index == 0 ? ' active' : ''),
				text: entry.name,
				'data-feedtype': entry.type
			}).on( "click", function() {
				var thisCategory = $(this),
					thisFeedtype = thisCategory.data("feedtype");

				if(thisFeedtype === 'all'){
					feedItems.addClass('hide current');
					feedItems.parent().addClass('hide');
					feedItems.slice(0, itemsPerPattern).removeClass('hide');
					feedItems.slice(0, itemsPerPattern).parent().removeClass('hide');
				}else{
					feedItems.addClass('hide').removeClass('current');
					feedItems.parent().addClass('hide');

					var currentCategory = feedItems.filter(function( index ) {
						return $(this).data("feedtype" ) === thisFeedtype;
					});

					currentCategory.addClass('current');
					currentCategory.slice(0, itemsPerPattern).removeClass('hide');
					currentCategory.slice(0, itemsPerPattern).parent().removeClass('hide');

					feedItemsContainer.addClass('filtered ' + thisFeedtype);
				}

				($('.current.hide', feedItemsContainer).length > 0) ? $('.load-more', feedControls).show() : $('.load-more', feedControls).hide();

				feeds.removeClass('all-feeds');

				if ($(this).data("feedtype") == 'all'){
					feeds.addClass('all-feeds');
				}
			}).appendTo(feedCategories);
		});

		processCategorySelectors();
	}

	function buildFeeds(){
		var feedData = '',
			counter = 1;

		if (!feedsArray.length) return;

		$.each(feedsArray, function(index, entry) {
			var feedDate = (entry.date == 'blog' ) ? entry.timestamp : new Date(entry.timestamp),
				feedMonth = feedDate.getMonth(),
				feedMonthsArray = ['January','February','March','April','May','June','July','August','September','October','November','December'],
				feedDay = feedDate.getDate(),
				feedYear = feedDate.getFullYear(),
				feedHour = feedDate.getHours(),
				feedHourFormatted = (feedHour % 12 != 0) ? (feedHour % 12) : 12, /* the hour '0' should be '12' */
				feedMinutes = feedDate.getMinutes(),
				ampm = feedHour >= 12 ? 'pm' : 'am';

			if (entry.type == 'facebook' && entry.text === undefined) return true;

			feedData += '<div class="feed-item invisible ' + entry.type + ' item-'+ counter + '" data-feedtype="' + entry.type + '">';

			if (entry.image) {
				feedData += '<div class="feed-thumb"><div style="background-image:url(' + entry.image + ');"></div></div>';
			}

			var textString = entry.text,
				textStringLength = entry.text.length,
				requiredLength = 120,
				trimmedTextString = textString.substring(0, requiredLength);

			feedData += '<div class="feed-descr">';
			feedData += '<h3 class="feed-title">' + entry.title + '</h3>';
			feedData += '<time class="feed-date">'+ feedDay + ' ' + feedMonthsArray[feedMonth] + ' '+ feedHourFormatted +':'+ feedMinutes +''+ ampm +' </time>';
			feedData += '<p class="feed-text">' + trimmedTextString + (textStringLength > requiredLength ? '...' : '') +'</p>';
			feedData += '</div>';
			feedData += '<a class="feed-link" href="' + entry.url + '" target="_blank" aria-label="Click to open link">';
			feedData += '</a>';
			feedData += '</div>';

			counter++;

		});

		feeds.removeClass('loading');

		feedItemsContainer.empty().removeClass(function (index, className) {
			return (className.match (/items-per-pattern-\S+/g) || []).join(' ');
		}).addClass('items-per-pattern-' + itemsPerPattern).append(feedData);

		feedItems = $('.feed-item', feedItemsContainer);

		for(var i = 0; i < feedItems.length; i += itemsPerPattern) {
			feedItems.slice(i, i + itemsPerPattern).wrapAll('<div class="pattern" />');
		}

		feedItems.addClass('hide current');
		feedItems.parent().addClass('hide');
		feedItems.slice(0, itemsPerPattern).removeClass('hide');
		feedItems.slice(0, itemsPerPattern).parent().removeClass('hide');

		feedItems.each(function(index){
			var that = this;
			var t = setTimeout(function() {
				$(that).removeClass("invisible");
			}, 50 * index);
		});

		if( feedItems.length > itemsPerPattern ){

			$('<button />', {class: 'button load-more', text: 'Load More'})
				.on( "click", function() {
					$('.current.hide', feedItemsContainer).slice(0,itemsPerPattern).removeClass('hide');
					$('.current:not(.hide)', feedItemsContainer).parent().removeClass('hide');

					($('.current.hide', feedItemsContainer).length > 0) ? '' : $(this).hide();
				})
				.appendTo(feedControls);
		}
	}

	function loadFeeds(){
		if(feedCredentials) {

			feedsLoading = true;

			var ajaxCalls = [];

			$.each(feedCredentials, function(index, feed) {
				if (feed.type && feed.name && feed.value) {

					var feedPath;

					if (feed.type == 'instagram') {
						feedPath = '/json/instagram.json?screen_name=' + feed.value;
					} else if (feed.type == 'facebook') {
						feedPath = '/json/facebook.json?profile_id=' + feed.value;
					} else if (feed.type == 'twitter') {
						feedPath = '/json/twitter.json?screen_name=' + feed.value;
					} else if (feed.type == 'blog') {
						feedPath =  templateURL + 'assets/desktop/php/blog-feed.php?url=' + feed.value + '&posts_limit=30&tag=' + (typeof blogTags != 'undefined' ? blogTags : '');
					}

					if (!feedPath) return;

					var deferred = $.Deferred();

					$.ajax({
						dataType: "json",
						url: feedPath,
						success: function(json) {

							var data = (feed.type == 'blog') ? json : json.data;

							if (!data || !data.length) {
								deferred.resolve();
								return;
							}

							feedCategoriesArray[index] = {
								name: feedCredentials[index].name,
								type: feedCredentials[index].type
							};

							$.each(data, function(i,entry) {
								feedsArray.push({
									type: feed.type,
									timestamp: (feed.type == 'blog') ? (new Date(entry.date)).getTime() : entry.timestamp * 1000,
									id: entry.id,
									url: entry.url,
									title: (feed.type == 'blog') ? entry.title : siteSettings.name,
									text: (feed.type == 'instagram') ? entry.title : (feed.type == 'blog') ? entry.text.replace('Read More','') : entry.text,
									author: (feed.type == 'facebook') ? entry.author.name : (feed.type == 'blog') ? '' : entry.author.screen_name,
									image: entry.images ? entry.images.standard : entry.image ? entry.image : null
								});
							});

							deferred.resolve();
						},
						error: function(){
							deferred.resolve();
						}
					});

					ajaxCalls.push(deferred);
				}

			});

			$.when.apply(this, ajaxCalls).then(function() {
				feedsLoading = false;
				feedsLoaded = true;

				feedsArray.sort(function(a,b){return b.timestamp - a.timestamp});

				buildFeeds();

				buildCategories();
			});
		}
	}

	windowObject.on('scroll.feeds load.feeds init.feeds', function(){
		requestAnimationFrame(function () {
			if (!feedsLoaded && !feedsLoading) {
				if (feeds.length && windowCurrentScroll > (feeds.position().top - windowHeight)) {
					feedsLoading = true;

					itemsPerPattern = calculateFeedsPattern();
					loadFeeds();
				}
			}
		});

	}).trigger('init.feeds');

	windowObject.on('resize.feeds', function () {
		if(feedsLoaded) {
			rebuildFeeds();
		}
	});

})();