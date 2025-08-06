const txtContent = document.getElementById("txt-content");
const sectionBtn = document.getElementById("buttons");
const webPage = "https://www.dnd5eapi.co";
const apiEndpoint = "https://www.dnd5eapi.co/api/2014/";

// Retrieves and handles api data
async function getData(url) {
  try {
    const result = await fetch(url);

    if (!result.ok) {
      throw new Error(`status code: ${result.status}`);
    }
    const data = await result.json();
    console.log(data);
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
    categoryLink.addEventListener("click", async () => {
      try {
        const categoryRes = await fetch(cat.url); // Use value from original data
        const categoryData = await categoryRes.json();

        clearContent(txtContent); // Clear old content

        categoryData.results.forEach((entry) => {
          const entryLink = document.createElement("li");
          entryLink.classList.add("linkStyle");
          entryLink.id = entry.name; // Add unique ID to each entry
          entryLink.textContent = entry.name || entry.index;
          txtContent.appendChild(entryLink);
          txtContent.appendChild(document.createElement("br"));
          //
          // Another eventlistener deeper into the hierarchy:
          //
          entryLink.addEventListener("click", async () => {
            try {
              const categoryRes = await fetch(webPage + entry.url); // Use url value from collected entry data
              const categoryData = await categoryRes.json();
              console.log("du klikket på: ", webPage + entry.url);
              console.log(categoryData);
              clearContent(txtContent); // Clear old content

              // Create header h2 for name of unit/equipment/spell and a paragraph for description
              // Check with if statements if other posibillities are available to display
              const desc = document.createElement("p");
              const descHeading = document.createElement("h2");
              if (categoryData.image) {
                // If image exists as a property
                const unitImg = document.createElement("img");
                unitImg.src = webPage + categoryData.image; // add source of image as webPage + the url of image
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
                    //const arrayInfo = document.createElement("p");
                    //arrayInfo.classList.add("linkStyle");
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
                    sectionBtn.append(propData);
                    console.log("prop1: ", prop, "prop2: ", prop2);
                  }
                }
                //continue;

                //display data if property is not object and not an array
                else {
                  propData.textContent =
                    prop.toUpperCase() + " : " + categoryData[prop];
                  sectionBtn.append(propData);
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
//console.log("This is categories: ", getCategories(apiEndpoint));
console.log(
  "This is getInformationFromCat: ",
  getInformationFromCat(apiEndpoint)
);
// Function to clear elements
function clearContent(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
//Function to dive deeper into the API
function exploreData(data, depth = 0) {
  const indent = "  ".repeat(depth);
  let maxDepth = depth;

  if (Array.isArray(data)) {
    console.log(`${indent}📁 Array`);
    data.forEach((item, index) => {
      console.log(`${indent}  ↳ [${index}]`);

      const container = document.createElement("div");
      container.classList.add("linkStyle");
      sectionBtn.append(container);
      if (item.name) {
        container.textContent = item.name;
        console.log("Item name:", item.name);
      }
      if (item.desc) {
        container.textContent = item.desc;
        console.log("Item description: ", item.desc);
      }
      if (item.url) {
        container.textContent = item.url;
        console.log("URL is :", item.url);
      }
      const childDepth = exploreData(item, depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    });
  } else if (typeof data === "object" && data !== null) {
    console.log(`${indent}📂 Object`);
    for (let key in data) {
      console.log("Looping through an object:");
      console.log(`${indent}  🔑 ${key}:`);

      //Create a bunch of links
      const createLink = document.createElement("a");
      createLink.textContent = key;
      createLink.classList.add("linkStyle");
      sectionBtn.appendChild(createLink);
      // Create eventlistener "Click" with async
      createLink.addEventListener("click", async () => {
        const getMoreInfo = await fetch(webPage + data.url);
        const getResults = await getMoreInfo.json();
        clearContent(sectionBtn);
        exploreData(getResults);
      });

      const childDepth = exploreData(data[key], depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  } else if (data !== undefined && data !== "") {
    console.log(`${indent}📄 ${typeof data}: ${JSON.stringify(data)}`);
  }

  return maxDepth;
}
