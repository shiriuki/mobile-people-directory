<%--
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
--%>

<%@ taglib uri="http://alloy.liferay.com/tld/aui" prefix="aui"%>
<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet"%>
<%@ taglib uri="http://liferay.com/tld/theme" prefix="liferay-theme"%>
<%@ taglib uri="http://liferay.com/tld/ui" prefix="liferay-ui"%>
<%@ taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %>

<%@ page contentType="text/html; charset=UTF-8"%>

<%@ page import="com.liferay.portal.service.GroupLocalServiceUtil" %>
<%@ page import="com.liferay.portal.service.UserLocalServiceUtil" %>
<%@ page import="com.liferay.portal.model.Group" %>
<%@ page import="com.liferay.portal.model.User" %>
<%@ page import="com.liferay.portal.kernel.dao.orm.CustomSQLParam"%>
<%@ page import="com.liferay.portal.kernel.util.Validator" %>
<%@ page import="com.liferay.portal.kernel.util.Constants"%>
<%@ page import="com.liferay.portal.kernel.util.ParamUtil" %>
<%@ page import="com.liferay.portal.kernel.util.OrderByComparator"%>
<%@ page import="com.liferay.portal.kernel.util.GetterUtil"%>
<%@ page import="com.liferay.portal.kernel.servlet.SessionMessages" %>
<%@ page import="com.liferay.portal.kernel.servlet.SessionErrors" %>
<%@ page import="com.liferay.portal.kernel.workflow.WorkflowConstants"%>
<%@ page import="com.liferay.portal.util.PortalUtil" %>
<%@ page import="com.liferay.portlet.PortletPreferencesFactoryUtil"%>
<%@ page import="com.liferay.util.portlet.PortletProps"%>
<%@ page import="com.liferay.portal.kernel.util.StringPool"%>

<%@ page import="com.rivetlogic.portlet.peopledirectory.PeopleDirectoryPortlet" %>
<%@ page import="com.rivetlogic.util.CustomComparatorUtil"%>
<%@ page import="com.rivetlogic.util.PeopleDirectoryUtil"%>
<%@ page import="com.rivetlogic.configuration.ConfigurationActionImpl"%>

<%@ page import="java.util.LinkedHashMap"%>
<%@ page import="javax.portlet.PortletPreferences"%>
<%@ page import="javax.portlet.PortletURL"%>

<portlet:defineObjects />
<liferay-theme:defineObjects />

<%
	String DEFAULT_RECORD_COUNT = PeopleDirectoryUtil.getDefaultRowCount(renderRequest);
	PortletPreferences preferences = renderRequest.getPreferences();
	Group group = GroupLocalServiceUtil.getGroup(scopeGroupId);
 	int searchResultsPerPage = GetterUtil.getInteger(preferences.getValue(ConfigurationActionImpl.PREFERENCE_SEARCH_RESULTS_PER_PAGE, DEFAULT_RECORD_COUNT));
%>

<script type="text/javascript">
	var peopleDirectoryPortlet_rowCount = "<%=searchResultsPerPage%>";
	var <portlet:namespace />portletNamespace = "<portlet:namespace />";
	var peopleDirectoryPortlet_ResourceUrl = "<portlet:resourceURL />";
</script>