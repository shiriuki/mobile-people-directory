/**
 * Copyright (C) 2005-2014 Rivet Logic Corporation.
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

AUI().use('node', 'event','event-key','aui-io-request', 'node-event-simulate','event-base','aui-paginator-old','aui-form-validator', function(A) {
	var PEOPLE_DIRECTORY_TEMPLATES = {
	    searchResultsHeader: '<div class="results">Total: {total} user{pluralization} found</div>',
	    contentSearchItem: '<div class="business-card">' + 
	                           '<div class="document-title">{title}</div>' +
	                           '<div class="document-url">{description}</div>' + 
	                           '<div class="full-name">{username}</div>' +
	                       '</div>',
        profileInfoTable: '<table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                '<tr><td>Job Title:</td><td class="info">{jobTitle}</td></tr>' +
                                '<tr><td>Screen Name:</td><td class="info" >{screenName}</td></tr>' +
                                '<tr><td>City:</td><td class="info" >{city}</td></tr>' +
                                '<tr><td>Phone:</td><td class="info">{phone}</td></tr>' + 
                           '</table>',
        profileResult: '<div class="small-profile-box page{itemNumber}" id ="{id}-small-profile-box">' +
                           '<div class="small-photo-box" id="{id}-small-photo-box">' +
                           '<img src="{portraitUrl}" height="55" id="{id}-picture" />' +
                       '</div>' +
                       '<div class="summary-box" id ="{id}-summary-box">' +
                           '<div class="field-value">{fullName}</div>' +
                           '<div class="mail field-value"><a href="mailto: {emailAddress}">{emailAddress}</a></div>' +
                           '<div class="more-info" style="display:none" id="{id}-more-info"></div>' +
                       '</div>' +
                       '<div class="slide-down" data-user-id="{id}" id="{id}-slide-down" ></div>' + 
                           '<div class="slide-up" data-user-id="{id}" id="{id}-slide-up" style="display:none"></div>' +
                           '<div class="clearfix"></div>' +
                       '</div>'
	};
	
	paginator = null;
	
    performSearch = function(searchText,searchContent,maxItems){
        var url = peopleDirectoryPortlet_ResourceUrl;
        var pdAction = searchContent == 'true' ? "content-search" : "keyword-search";
        A.io.request(url, {
            method: "GET",
            data: {
                "pdAction":pdAction,
                "keywords":searchText,
                "start": 0,
                "end":maxItems
            },
            dataType: 'json',
            on: {
                success: function(){
                	var responseData = this.get('responseData');
                	showSearchResults(responseData, pdAction);
                	//creates paginator
                	if (!paginator) {
                	    paginator = createsPaginator(responseData.searchCount);
                        paginator.render();
                	} else {
                	    paginator.set('total', responseData.searchCount);
                	    paginator.set('page', 1);
                	    paginator.changeRequest();
                	}
                    
                },
                failure: function(xhr, ajaxOptions, thrownError){
                    displayError("Error searching for keywords");
                }
            }
        });
    },
    
    createsPaginator = function(maxPagesLinks){
    	return new A.PaginatorOld({
    		alwaysVisible: false,
        	containers : '#paginator',
        	total: maxPagesLinks,
        	maxPageLinks: 15,
        	rowsPerPage: peopleDirectoryPortlet_rowCount,
        	nextPageLinkLabel: 'Next',
    		prevPageLinkLabel: 'Prev',
    		on:{
        		changeRequest: function(event) {
        			A.all('#searchResults .small-profile-box').setStyle('display', 'none');
	        		var instance = this;
					var newState = event.state;
					var page = newState.page;
					if(peopleDirectoryPortlet_rowCount == 1){
						A.one('#searchResults .page'+page).setStyle('display', 'block');
					}else{ 
						var total = page * peopleDirectoryPortlet_rowCount;
						var i =  page == 1 ? total - peopleDirectoryPortlet_rowCount : total - peopleDirectoryPortlet_rowCount +1; 
						for(i; i <= total; i++){
							var item = A.one('#searchResults .page'+i);
							if(item != null)
								item.setStyle('display', 'block');
						}
					}
					instance.setState(newState);
        		}
        	},
    		template: '{FirstPageLink} {PrevPageLink} {PageLinks} {NextPageLink} {LastPageLink} {CurrentPageReport} {Total}'
    	});
    },
    showSearchResults = function(responseData,pdAction){
        var searchResults = "";
        if(responseData.resultsArray.length > 0){
        	 searchResults+= A.Lang.sub(PEOPLE_DIRECTORY_TEMPLATES.searchResultsHeader, {total: responseData.searchCount, pluralization: (responseData.searchCount > 1 ? "s":"")}); 
        	if(pdAction == "keyword-search"){
        		//alert("showSearchResults, results array length: " + responseData.resultsArray.length);
        		for(var i=0; i< responseData.resultsArray.length; i++){
        			//alert(responseData.resultsArray[i].fullName);
        			searchResults += addSearchResult(responseData.resultsArray[i], i);
        		}
            }else if(pdAction == "content-search"){
            	
            	for(var i=0; i< responseData.resultsArray.length; i++){
            	    searchResults += A.Lang.sub(PEOPLE_DIRECTORY_TEMPLATES.contentSearchItem, {title: responseData.resultsArray[i].title,
            	        description: responseData.resultsArray[i].description, username: responseData.resultsArray[i].userName});
            	}
            }
        }else{
            searchResults += "<div>No Search Results Found</div>";
        }
        if(A.UA.gecko > 0){
            A.one("#searchResults").html(searchResults);
        } else {
            A.one("#searchResults").empty().append(searchResults);
        }
        // add handlers for the new elements
        A.all('div.slide-down').on('click', performCompleteProfileSearch);
        A.all('div.slide-down').on('click',slideDown );
        A.all('div.slide-up').on('click',slideUp);
   
    },
    
    performCompleteProfileSearch = function(event){
    	event.halt();
   	 	var url = peopleDirectoryPortlet_ResourceUrl;
		var item = event.currentTarget;
		var userId = item.attr('data-user-id');
	     A.io.request(url, {
	         method: "GET",
	         data: {
	             "pdAction":'show-complete-profile',
	             "userId": userId
	         },
	         dataType: 'json',
	         on: {
	             success: function(){
	            	 showCompleteProfile(this.get('responseData'), userId);
	             },
	             failure: function(xhr, ajaxOptions, thrownError){
	                 displayError("Error searching for complete profile for userId" + userId);
	             }
	         }
	     });
   },
   showCompleteProfile = function(responseData, userId){
	   var element = A.one("#" + userId + "-more-info");
	   element.setContent("");
	   var box = A.Lang.sub(PEOPLE_DIRECTORY_TEMPLATES.profileInfoTable, responseData);
	   element.append(box);
   },
   
   addSearchResult = function (user, i) {
    	var userId = user.id;
    	user.itemNumber = (i+1);
        var box = A.Lang.sub(PEOPLE_DIRECTORY_TEMPLATES.profileResult, user);
		
		return box;
    },
    slideDown = function(event){
        /* to adjust size for some mobile devices 768 comes from liferay default mobile viewport breakpoints */
        var boxSize = (A.one('body').get('winWidth') <= 768) ? '80px' : '130px';
    	event.halt();
		var item = event.currentTarget;
		var user_id = item.attr('data-user-id');
    	$("#" + user_id + "-slide-down").hide();
    	//$("#" + user_id + "-small-profile-box").animate( {height: boxSize}, "slow");
    	$("#" + user_id + "-more-info").show();	
    	$("#" + user_id + "-slide-up").show();	
    	//$("#" + user_id + "-picture").width("120px");
    	$("#" + user_id + "-picture").height(boxSize).width(boxSize);
    	$("#" + user_id + "-small-photo-box").animate({height: boxSize, width:boxSize}, "slow");
    },
    slideUp = function(event){
    	event.halt();
		var item = event.currentTarget;
		var user_id = item.attr('data-user-id');
		$("#" + user_id + "-slide-up").hide();
		//$("#" + user_id + "-small-profile-box").animate( {height: "55px"}, "slow");	
		$("#" + user_id + "-more-info").hide();
		$("#" + user_id + "-slide-down").show();
		//$("#" + user_id + "-picture").width("60px");
		$("#" + user_id + "-picture").animate({height: "55px", width:"55px"}, "slow");
		$("#" + user_id + "-small-photo-box").animate({height: "55px", width:"55px"}, "slow");
    };
});