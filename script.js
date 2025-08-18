// Notation: This script fetches data from the D&D 5e API, displays categories, and allows users to search for monsters.
// Note to future work with API's - Using recursive functions is a good way to handle nested data structures.
// Could probably shorten the code by using a recursive function to handle the nested data structures.
// It includes functionality for searching monsters, displaying detailed information, and navigating through the data.
const txtContent = document.getElementById("txt-content");
const sectionBtn = document.getElementById("buttons");
const backBtn = document.getElementById("backBtn");
const webPage = "https://www.dnd5eapi.co";
const apiEndpoint = "https://www.dnd5eapi.co/api/2014/";
const navigationHistory = []; // Stores states as user navigates
let monsterCardWrapper = document.createElement("div"); // The wrapper of the monster cards
let searchMonsterInput = document.getElementById("searchmonsters");
let searchMonsterSubmit = document.getElementById("searchmonsterssubmit");
let searchMonstersForm = document.getElementById("search-monsters-form");
// prepend the search monster input form
sectionBtn.prepend(searchMonstersForm);

backBtn.textContent = "Back";
backBtn.addEventListener("click", goBack);
// Retrieves and handles api data
async function getData(url) {
  try {
    const result = await fetch(url);

    if (!result.ok) {
      throw new Error(`status code: ${result.status}`);
    }
    const data = await result.json();
    console.log(data);
    navigationHistory.push(url); // Save state
    updateBackBtnState();
    return data;
  } catch (error) {
    console.log("failed to fetch, error", error);
  }
}

// Gets all categories from 1st frontpage in DND API and puts it in a array and returns it
async function getCategories(address) {
  const data = await getData(address);
  const container4Categories = [];
  for (element in data) {
    // Push each URL and each category name into a array
    container4Categories.push({
      name: element,
      url: webPage + data[element],
    });
    //console.log(element);
    //console.log(webPage + data[element]);
  }
  return container4Categories;
}
// Function to extract information about the category after you have clicked one of the categories
async function getInformationFromCat(urlAddress) {
  const getInfoFromCat = await getCategories(urlAddress);
  getInfoFromCat.forEach((cat) => {
    // console.log(
    //   "This is category name: " + cat.name + " This is category URL: " + cat.url
    // );
    const categoryLink = document.createElement("li");
    categoryLink.classList.add("linkStyle");
    categoryLink.textContent = cat.name + "\n";
    txtContent.append(categoryLink);
    // First button click on the first homepage
    categoryLink.addEventListener("click", async () => {
      try {
        const categoryRes = await fetch(cat.url); // Use value from original data
        const categoryData = await categoryRes.json();
        navigationHistory.push(cat.url); // Save state
        clearContent(txtContent); // Clear old content

        categoryData.results.forEach((entry) => {
          const entryLink = document.createElement("li");
          entryLink.classList.add("linkStyle");
          entryLink.id = entry.name; // Add unique ID to each entry
          entryLink.textContent = entry.name || entry.index;
          txtContent.appendChild(entryLink);
          txtContent.appendChild(document.createElement("br"));
          // The second click after the first click on the homepage
          entryLink.addEventListener("click", async () => {
            try {
              const categoryRes = await fetch(webPage + entry.url); // Use url value from collected entry data
              const categoryData = await categoryRes.json();
              navigationHistory.push(webPage + entry.url); // Save state
              searchMonstersForm.classList.add("hidden"); // Hide search form
              clearContent(txtContent); // Clear old content

              // Create header h2 for name of unit/equipment/spell and a paragraph for description
              // Check with if statements if other posibillities are available to display
              const desc = document.createElement("p");
              const descHeading = document.createElement("h2");
              if (categoryData.image) {
                // If image exists as a property
                const unitImg = document.createElement("img");
                unitImg.src = webPage + categoryData.image; // add source of image as webPage + the url of image
                unitImg.classList.add("monsterimg");
                unitImg.alt = categoryData.name;
                sectionBtn.append(unitImg);
              } else {
                console.log("No Image was found");
              }
              desc.classList.add("linkStyle");
              descHeading.classList.add("linkStyle");
              desc.id = categoryData.name; // Add unique ID to each entry
              descHeading.textContent =
                categoryData.full_name || categoryData.index; // Add full name to heading
              desc.textContent = categoryData.desc; // add description to textcontent
              sectionBtn.append(descHeading, desc);
              sectionBtn.appendChild(document.createElement("br"));
              //
              // Run a for loop to loop through each property the property has
              //
              for (let prop in categoryData) {
                const value = categoryData[prop];
                const propData = document.createElement("strong");
                propData.classList.add("linkStyle");
                propData.id = prop;
                // IF the user is inside class the element class_levels will display other information than the other elements
                if (prop === "class_levels") {
                  propData.textContent =
                    prop.toUpperCase() + " : Click here for more information";
                  sectionBtn.append(propData);
                  // when the user clicks class levels inside classes
                  propData.addEventListener("click", async () => {
                    const classLevelsURL = webPage + categoryData.class_levels;
                    const getClassLevelData = await getData(classLevelsURL);
                    clearContent(sectionBtn);
                    // loops over data inside class_levels, index is the entire array of levels the class has
                    for (let index of getClassLevelData) {
                      const classLvlName = document.createElement("strong");
                      classLvlName.classList.add("linkStyle");
                      classLvlName.textContent = `${index.index}`;
                      sectionBtn.append(classLvlName);
                      // When the user clicks a level of the class
                      classLvlName.addEventListener("click", async () => {
                        clearContent(sectionBtn);
                        const classLevelsInfo = webPage + index.url;
                        const getClassLevelInfo = await getData(
                          classLevelsInfo
                        );
                        // Loops over each level of the class level
                        for (let key in getClassLevelInfo) {
                          const value = getClassLevelInfo[key];
                          const specificClassLvlName =
                            document.createElement("strong");
                          specificClassLvlName.classList.add("linkStyle");

                          if (
                            typeof value === "string" ||
                            typeof value === "number" ||
                            typeof value === "boolean"
                          ) {
                            // ✅ Primitive value
                            specificClassLvlName.textContent = `${key.toUpperCase()} : ${value}`;
                          } else if (Array.isArray(value)) {
                            // ✅ Array value
                            specificClassLvlName.textContent = `${key.toUpperCase()} : [Array with ${
                              value.length
                            } items]`;
                            value.forEach((item, index) => {
                              const itemEl = document.createElement("p");
                              itemEl.classList.add("linkStyle");
                              itemEl.textContent = `Name: ${item.name} click here for more info -`;
                              sectionBtn.append(itemEl);
                              itemEl.addEventListener("click", async () => {
                                clearContent(sectionBtn);
                                const getLevelupData = await getData(
                                  webPage + item.url
                                );
                                const lvlUpInfo = document.createElement("p");
                                lvlUpInfo.classList.add("linkStyle");
                                lvlUpInfo.textContent = `${getLevelupData.name.toUpperCase()} level: ${
                                  getLevelupData.level
                                } ${getLevelupData.desc}`;
                                sectionBtn.append(lvlUpInfo);
                              });
                            });
                          } else if (
                            typeof value === "object" &&
                            value !== null
                          ) {
                            // ✅ Object value
                            specificClassLvlName.textContent = `${key.toUpperCase()} : [Object]`;
                            for (let subKey in value) {
                              const subEl = document.createElement("p");
                              subEl.classList.add("linkStyle");
                              subEl.textContent = `  → ${subKey}: ${JSON.stringify(
                                value[subKey]
                              )}`;
                              sectionBtn.append(subEl);
                            }
                          } else {
                            // ❓ Unexpected type
                            specificClassLvlName.textContent = `${key.toUpperCase()} : [Unrecognized Type]`;
                          }

                          sectionBtn.append(specificClassLvlName);
                        }
                      });
                    }
                  });
                }
                // //
                // // Check if value is object and not an array
                // //
                if (
                  typeof value === "object" &&
                  Array.isArray(value) !== true
                ) {
                  let currentTitle = "";
                  for (let prop2 in value) {
                    if (prop !== currentTitle) {
                      currentTitle = prop;
                      propData.textContent = currentTitle.toUpperCase();
                    }
                    propData.textContent += " : " + prop2 + ":" + value[prop2];
                  }
                  sectionBtn.append(propData);
                }
                //Else if it is an array:
                //
                else if (Array.isArray(value)) {
                  for (let prop2 of value) {
                    if (prop2.type && prop2.value) {
                      propData.textContent =
                        prop.toUpperCase() +
                        ".  type: " +
                        prop2.type +
                        ".  value: " +
                        prop2.value;
                    }
                    if (prop2.name && prop2.desc) {
                      propData.textContent =
                        prop.toUpperCase() +
                        ". " +
                        prop2.name +
                        ". Description: " +
                        prop2.desc;
                    }
                    if (prop2.equipment) {
                      propData.textContent =
                        prop.toUpperCase() + ": " + prop2.equipment.name;
                    }
                    if (prop2.desc) {
                      propData.textContent =
                        prop.toUpperCase() + ": " + prop2.desc;
                    }
                    if (prop2.name && prop2.url) {
                      propData.textContent =
                        prop.toUpperCase() +
                        ": " +
                        prop2.name +
                        " Click for more info";
                      propData.addEventListener("click", async () => {
                        const getDataFromNameAndURL = await getData(
                          webPage + prop2.url
                        );
                        clearContent(sectionBtn);
                        propData.textContent = `Name: ${getDataFromNameAndURL.name}. Description: ${getDataFromNameAndURL.desc}`;
                        sectionBtn.append(propData);
                      });
                    }

                    sectionBtn.append(propData);
                    console.log("prop1: ", prop, "prop2: ", prop2);
                  }
                }
                //display data if property is not object and not an array
                else {
                  if (prop !== "class_levels") {
                    propData.textContent =
                      prop.toUpperCase() + " : " + categoryData[prop];
                    sectionBtn.append(propData);
                  }
                }
              }
            } catch (error) {
              console.log(`Failed to fetch ${cat.url}:`, error);
            }
          });
        });
      } catch (error) {
        console.log(`Failed to fetch ${cat.url}:`, error);
      }
    });
  });
}

getInformationFromCat(apiEndpoint);
// Function to clear elements
function clearContent(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
function updateBackBtnState() {
  backBtn.disabled = navigationHistory.length <= 1;
}
function goBack() {
  // Remove the current (latest) state
  navigationHistory.pop();

  const previousState = navigationHistory[navigationHistory.length - 1];
  if (previousState) {
    getData(previousState); // Load previous content
    getInformationFromCat(previousState); // Load previous category information
    updateBackBtnState(); // Update the back button state
  } else {
    console.log("Already at root level. No further steps back.");
  }
}

//Set the initial text to send because its not working without it
searchMonsterSubmit.value = "Send";
let monsterContainer = document.getElementById("monster-container");
// Code to make the user available to search for monsters.
// Get monsters submit button after searching for a monster
searchMonstersForm.addEventListener("submit", (e) => {
  searchMonsterSubmit.value =
    searchMonsterSubmit.value === "Send"
      ? (searchMonsterSubmit.value = "Reset")
      : (searchMonsterSubmit.value = "Send");
  // Check the opposite value because it gets put to send if it was reset when the button was pushed etc..
  if (searchMonsterSubmit.value === "Send") {
    clearContent(monsterContainer);
  }
  // Else if the button has been set to reset , indicating it was send: get monsters
  else if (searchMonsterSubmit.value === "Reset") {
    getMonsters(e);
  }
});

// getMonsters function
async function getMonsters(e) {
  e.preventDefault();
  let getMonsterAPI = apiEndpoint + "monsters/";
  let getMonsterData = await getData(getMonsterAPI);

  console.log(getMonsterData.results);
  console.log(getMonsterData.results.length);
  console.log(getMonsterData.results[0].name);
  clearContent(monsterCardWrapper);
  // Loops through all monsters
  for (let key = 0; key < getMonsterData.results.length; key++) {
    // If monster name includes any of the search input typing the user has typed
    if (
      getMonsterData.results[key].name
        .toLowerCase()
        .includes(searchMonsterInput.value.toLowerCase())
    ) {
      // then get the data of the monsters that are in the search result and create
      // a div to contain the image of the monster plus the title
      let getMonsterSearchResults = await getData(
        getMonsterAPI + getMonsterData.results[key].index
      );
      let monsterCard = document.createElement("div");
      let monsterTitle = document.createElement("p");
      let monsterPicture = document.createElement("img");
      monsterTitle.textContent = getMonsterSearchResults.name;
      monsterPicture.classList.add("monsterimgsearch");
      monsterPicture.alt = getMonsterSearchResults.name;
      monsterCard.classList.add("monster-card2");
      monsterCardWrapper.classList.add("monster-card");
      monsterPicture.src = webPage + getMonsterSearchResults.image;
      monsterCard.append(monsterPicture, monsterTitle);
      console.log(getMonsterSearchResults.image);
      monsterCardWrapper.append(monsterCard);
      // get the data from the monster the User clicks
      monsterCard.addEventListener("click", async () => {
        //Hide search form:
        searchMonstersForm.classList.add("hidden");
        clearContent(monsterCardWrapper);
        clearContent(sectionBtn);
        let getMonsterURL = await getData(
          webPage + getMonsterSearchResults.url
        );

        // Create image for monster once outside of for loop
        let monsterImgOriginal = document.createElement("img");
        monsterImgOriginal.classList.add("monsterimg");
        monsterImgOriginal.alt = getMonsterURL.name;
        monsterImgOriginal.src = webPage + getMonsterURL.image;
        let propertyWrapper = document.createElement("div");
        propertyWrapper.append(monsterImgOriginal);
        propertyWrapper.classList.add("buttons");
        for (key in getMonsterURL) {
          console.log("getMonsterURL[key] : ", getMonsterURL[key]);
          // if array is not true and it is an object only
          if (
            Array.isArray(getMonsterURL[key]) !== true &&
            typeof getMonsterURL[key] === "object"
          ) {
            let propertyHeading = document.createElement("h2");
            propertyHeading.classList.add("linkStyle");
            propertyHeading.textContent = key;
            propertyWrapper.append(propertyHeading);

            for (secondkey in getMonsterURL[key]) {
              let propertyDescription = document.createElement("p");
              propertyDescription.textContent = `${secondkey} : ${getMonsterURL[key][secondkey]}`; // The value of a object inside the original object
              propertyDescription.classList.add("linkStyle");
              propertyWrapper.append(propertyDescription);
            }
            continue;
          } // end of if statement checking if it is an object and not an array
          // THEN If it is an array with objects:
          if (Array.isArray(getMonsterURL[key]) && getMonsterURL[key].length) {
            //Then it is guaranteed that the next nested object is an object not an array

            let propertyHeading = document.createElement("h2");
            propertyHeading.classList.add("linkStyle");
            propertyHeading.textContent = key;
            propertyWrapper.append(propertyHeading);

            for (let i of getMonsterURL[key]) {
              // Check again if is an object and not an array inside the array
              if (i && typeof i === "object" && !Array.isArray(i)) {
                for (let prop in i) {
                  let propertyDescription = document.createElement("p");
                  propertyDescription.textContent = `${prop} : ${i[prop]}`; // The value of a object inside the original object
                  propertyDescription.classList.add("linkStyle");
                  propertyWrapper.append(propertyDescription);
                }
              } else {
                const p = document.createElement("p");
                p.classList.add("linkStyle");
                p.textContent = String(i);
                propertyWrapper.append(p);
              }
            }
            continue;
          }

          // Normal rendering
          let propertyHeading = document.createElement("h2");
          let propertyDescription = document.createElement("p");
          propertyHeading.textContent = key;
          propertyDescription.textContent = getMonsterURL[key];
          propertyHeading.classList.add("linkStyle");
          propertyDescription.classList.add("linkStyle");
          propertyWrapper.append(propertyHeading, propertyDescription);
        }
        document.body.append(propertyWrapper);
      });
    }
    monsterContainer.append(monsterCardWrapper);
  }
}
