/*
Storage Structure

 │
 ├─► class_list    dict: {"subject_names": list, "section_names": list} ─► Stores the actual class list of the Subject and Section names which will be used to rename from.
 │
 ├─► ignore_sections    boolean: Stores a boolean value which controls if section names should be ignored while renaming.
 │
 ├─► gcr_redirection    boolean: Stores a boolean value which controls if the extension should redirect the user to the correct user id on GCR tabs with user id which doesn't match storage.
 │
 ├─► gcr_url    int: Stores the actual google account user-id
 │
 ├─► just_installed     boolean: Stores a boolean value which indicates if the extension was just installed. It will be true only upon installation/update.
 │
 └─► backup    dict: Stores all user data together
 */


let subject_list = [];
let section_list = [];
const renameBtn = document.getElementById('rename-btn');
const submitBtn = document.getElementById('submit');
const classesAmount = document.getElementById('classes-amount');
const subjectsArea = document.getElementById('subjects-area');
const sectionsArea = document.getElementById('sections-area');
const settings_page = document.getElementById('settings-page');

chrome.storage.local.get(['just_installed'], (res) => {
    console.debug(res)
    if (res.just_installed) {
        chrome.storage.local.set({'just_installed': false});
        chrome.storage.sync.get(['backup'], (res) => {
            console.log("Backup: " + res.backup);
            let temp_json = {};
            if (res.backup !== undefined) {
                get_from_local('ignore_sections').then((ignore_sections) => {
                    temp_json['ignore_sections'] = ignore_sections;
                    get_from_local('class_list').then((result) => {
                        temp_json['section_names'] = result['section_names'];
                        temp_json['subject_names'] = result['subject_names'];
                        console.debug(JSON.stringify(temp_json));
                        console.debug(JSON.stringify(res.backup));
                        if (JSON.stringify(temp_json) !== JSON.stringify(res.backup)) {
                            console.log("Current settings are different from backup.");
                            console.log(JSON.stringify(temp_json) !== JSON.stringify(res.backup));
                            let tickbox = document.getElementById("backup_found");
                            tickbox.checked = true;
                        } else {
                            console.log("current settings are same as previous backup");
                        }
                    });
                });
            }
        });
    }
});


// TODO : Make force dark mode for gcr
console.log("JS Loaded");
console.log(location.pathname)
// index.html JS
if (location.pathname === "/index.html") {
    // const BtnContainer = document.getElementById('lower');
    // const expForURL = new RegExp("classroom\\.google\\.com/u/\\d+"); // TODO : Add support for classroom.google.com
    create_lists().then(() => {
        get_from_local('class_list').then((result) => {
            if (result['subject_names'] === undefined) {
                console.log('subject names is undefined')
            }
            else if (result['subject_names'].length > 0) {
                create_boxes(result['subject_names'].length, subjectsArea, sectionsArea);
                toggle_rename_button("on");

                let class_number_input = document.getElementById('classes-amount');
                class_number_input.setAttribute("value", result['subject_names'].length);

            }
        });

    })


/*

    >> Event Listeners

       This part of the code is responsible for listening to events and performing actions accordingly.
       It contains only event listeners.

*/

    settings_page.addEventListener('click', () => {
        window.location.href = "settings.html";
    })

    submitBtn.addEventListener('click', () => { // Event listener for the submit button
        const amount = classesAmount.value.trim();
        let amountError1;
        let amountError2;

        if (isNaN(parseInt(amount))) {  // If amount is not NaN and is not empty
            amountError1 = true;
            classesAmount.style.border = "1px solid red";
        } else {
            amountError1 = false;
            classesAmount.style.border = "1px solid white";
        }

        if (parseInt(amount) < 1 || parseInt(amount) > 100) { // If amount between 1 and 100
            amountError2 = true;
            classesAmount.style.border = "1px solid red";
        } else {                // If amount is not a number
            amountError2 = false;
            classesAmount.style.border = "1px solid white";
        }

        console.debug(amountError1, amountError2);

        // false = valid, true = invalid
        if (!amountError1 && !amountError2) {    // If both inputs are valid
            create_lists(true).then(() => {
                console.debug("created lists")
                create_boxes(parseInt(amount), subjectsArea, sectionsArea);
                toggle_rename_button("on");

            });

        }
    });


    renameBtn.addEventListener('click', () => { // Event listener for the rename button
        let subject_names = [];
        let section_names = [];
        let subject_inputs = document.getElementsByClassName("subject-box");
        let section_inputs = document.getElementsByClassName("section-box");
        for (let i = 0; i < subject_inputs.length; i++) {
            subject_names.push(subject_inputs[i].value);
        }
        for (let i = 0; i < section_inputs.length; i++) {
            section_names.push(section_inputs[i].value);
        }
        console.info("Subjects: " + JSON.stringify(subject_names));
        console.info("Sections: " + JSON.stringify(section_names));
        store_to_local("class_list", {
            "subject_names": subject_names,
            "section_names": section_names
        }).then(() => {
            console.info("Class list set");
            save_backup();
        });
    });

}



/*
    >> Functions

        This part of the code contains all the functions that are used in the code.
        It contains all the functions that are used in the code.

 */





function create_boxes(number, subjectsArea, sectionsArea) {
    subjectsArea.innerText = "";
    sectionsArea.innerText = "";

    const subjectHeading = document.createElement('h4');
    const sectionHeading = document.createElement('h4');

    subjectHeading.textContent = "Subject Names";
    sectionHeading.textContent = "Section Names";

    subjectsArea.appendChild(subjectHeading);
    sectionsArea.appendChild(sectionHeading);

    for (let i = 0; i < number; i++) {
        const boxForSubject = document.createElement("input");
        const boxForSection = document.createElement("input");

        boxForSubject.setAttribute("type", "text");
        boxForSubject.setAttribute("class", "subject-box");
        boxForSubject.setAttribute("value", subject_list[i]);
        boxForSubject.required = true;

        boxForSection.setAttribute("type", "text");
        boxForSection.setAttribute("class", "section-box");
        boxForSection.setAttribute("value", section_list[i]);
        boxForSection.style.marginLeft = "auto";
        boxForSection.required = true;

        subjectsArea.appendChild(boxForSubject);
        sectionsArea.appendChild(boxForSection);
    }

}

function create_lists() {
    return new Promise((resolve) => {
        get_from_local('class_list').then( (result) => {
            console.debug(result);
            if (result['subject_names'] === undefined) {
                console.log("No class list found")
            } else {

                for (let i = 0; i < result['subject_names'].length; i++) {
                    subject_list.push(result['subject_names'][i]);
                    section_list.push(result['section_names'][i]);
                }
            }

        });
        resolve();
    });
}



function toggle_rename_button(state) {
    // hide and show rename button
    if (state === "on") {
        renameBtn.style.display = "block";
    } else {
        renameBtn.style.display = "none";
    }
}

function store_to_cloud(data) {
    return new Promise( (resolve) => {
        chrome.storage.sync.set(data, () => {
            resolve();
        });
    });
}

/*
function get_from_cloud(key) {
    return new Promise( (resolve) => {
        chrome.storage.sync.get([key], (result) => {
            resolve(result[key]);
        });
    });
}
*/

function save_backup() {
    get_from_local('class_list').then((result) => {
        console.log(result);
        let temp_json = result;
        get_from_local('ignore_sections').then((ignore_sections) => {
            temp_json['ignore_sections'] = ignore_sections;
            console.log(temp_json);
            store_to_cloud({'backup': temp_json}).then(() => {
                console.log("Backup saved to cloud");
                // TODO: Make it save locally too
            });
        });
    });
}

function store_to_local(data_type, data) {
    return new Promise( (resolve) => {
        chrome.storage.local.set({[data_type]: data}, () => {
            resolve();
        });

    });
}

function get_from_local(data_type) {
    return new Promise( (resolve) => {
        chrome.storage.local.get([data_type], (result) => {
            resolve(result[data_type]);
        });

    });
}