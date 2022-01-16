'use strict';

// https://developer.chrome.com/extensions/background_pages

var collapsed_state = false;

//--------------------------
//  EVENT LISTENERS
//--------------------------

chrome.tabGroups.onCreated.addListener( (group) => {
	autoCollapse();
});

chrome.storage.onChanged.addListener((changes, area) => {
	let newValue = (changes.options || {}).newValue;
	if(area === 'sync' && newValue) {
		// options = newValue;
		//Do updates based on settings
		autoCollapse();
	}
});

chrome.commands.onCommand.addListener( (command) => {
	switch(command) {
		case 'create-group':
			createGroup(); break;
		case 'create-tab':
			createTab(); break;
		case 'toggle-all-groups':
			toggleAllGroups(); break;
		case 'close-group':
			closeGroup(); break;
		default:
			console.log(`Command ${command} not found`);
	}
});

//--------------------------
//   MAIN ENTRY FUNCTIONS
//--------------------------


async function closeGroup() {
	let [tab] = await getCurrentTab();
	if(tab.groupId) {
		let groupTabs = await chrome.tabs.query({groupId: tab.groupId});
		groupTabs.forEach(tab => {
			chrome.tabs.remove(tab.id);
		});
	}
}

async function toggleAllGroups() {
	collapsed_state = !collapsed_state;
	let [tab] = await getCurrentTab();
	// Get all groups in current window
	let groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
	//Toggle all but the currently active group
	groups.forEach((group) => {
		if(!tab.groupId || tab.groupId != group.id ){
			toggleGroup(group, collapsed_state);
		}
	});
}

async function createGroup() {
	//GET CURRENT TAB INFO
	let [tab] = await getCurrentTab();
	// PROMPT USER FOR TITLE
	let options = await getOptions();
	if(options.autoName) {
		createGroupByTab(tab);
	} else {
		//For some reason the promise doesn't work.... 😒
		//TODO - Investigate
		chrome.tabs.sendMessage(tab.id, {
			type: 'GROUPTITLE',
			payload: {
				message: suggestTitle(tab)
			}
		}, (response) => { 
			createGroupByTab(tab, (response || {}).message);
		});
	}
}


async function createTab() {
	let [current] = await getCurrentTab();
	const props = {
		active: true,
		openerTabId: current.id,
	}
	let newTab = await chrome.tabs.create(props);
	chrome.tabs.group({ groupId: current.groupId, tabIds: newTab.id });
}

//--------------------------
//     HELPER FUNCTIONS
//--------------------------

async function createGroupByTab(tab, groupName) {
	groupName = groupName || suggestTitle(tab);
	//GREATE GROUP
	let groupId = await chrome.tabs.group({ tabIds: tab.id });
	//NAME GROUP
	await chrome.tabGroups.update(groupId, { 
		title: groupName 
	});
	console.log(`Group ${groupId} created with title ${groupName}`);
}

function toggleGroup(group, collapsed) {
	chrome.tabGroups.update(group.id, {collapsed: collapsed });
}

async function autoCollapse() {
	let options = await getOptions();
	if(options.autoCollapse) {
		collapsed_state = false;
		toggleAllGroups();
	}
}

// TODO - Should probably rename to "Settings"
// TODO - There's also a possiblity of the options not being in sync initially.. Simple fix
function getOptions() {
	return chrome.storage.sync.get('options');
}

function getCurrentTab() {
	const queryOptions = { active: true, currentWindow: true };
	return chrome.tabs.query(queryOptions);
}

function suggestTitle(tab) {
	const tab_title = tab.title || 'New Group';
	return tab_title.substring(0, tab_title.length > 36 ? 36: tab_title.length);
}
