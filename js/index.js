
function get_info() {
    return new Promise(function (resolve) {
        chrome.storage.local.get(['info'], function (result) {
            resolve(result.info);
        });
    });
}

function set_info(account_info) {
    chrome.storage.local.set({info: account_info}, function () {
        console.log('Value is set to ' + account_info);
    });
}


function set_account_info(account_number, info) {
    return new Promise(function (resolve) {
        _location = `account_info_${account_number}`;

        chrome.storage.local.set({ [_location]: JSON.stringify(info) },
            () => {
                console.log('Value for ' + _location + ' set to ');
                console.log(info);
                resolve();
            }
        )
    });
}

function get_classes(account_number) {
    return new Promise(function (resolve) {
        let _tab = chrome.tabs.create({ url: `https://classroom.google.com/u/${account_number}/h` });
        // wait for the tab to load
        // close _tab
        let e = GetElementsByExactClassName("YVvGBb");
        console.log(e);
        _tab.close // TODO : fix this
        resolve();
    })
}

function get_class_names(account_number) {
    return new Promise( (resolve) => {
        __location = `class_info_${account_number}`;
        chrome.storage.local.get([storage_location], function (result) {
            resolve(JSON.parse(result[storage_location]));
        });
    })
}



get_classes(1).then(function (classes) {
    console.log(classes);
}
);



set_account_info(1, {
    "subject_names": ["Main Class Group", "English", "History/Geography", "Economics/Civics", "Hindi", "Biology", "Physics", "Chemistry", "Math", "AI", "Mental Ability", "Art"],
    "section_names": ["Class Group"]
});



set_info({"number_of_accounts": 1, "default_account": 1});

get_info().then((result) => {
    console.log(result);
})


// Finds all elements with only given exact class name.
function GetElementsByExactClassName(class_name) {
    let i, length, element_list, data = [];
    element_list = document.getElementsByClassName(class_name);
    if (!element_list || !(length = element_list.length))
    return [];
    for (i = 0; i < length; i++) {if (element_list[i].className === class_name)data.push(element_list[i]);}
    return data;}
