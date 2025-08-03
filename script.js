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
    console.log(element);
    console.log(webPage + data[element]);
  }
  return container4Categories;
}
// Function to extract information about the category after you have clicked one of the categories
async function getInformationFromCat(urlAddress) {
  const getInfoFromCat = await getCategories(urlAddress);
  getInfoFromCat.forEach((cat) => {
    console.log(
      "This is category name: " + cat.name + " This is category URL: " + cat.url
    );
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

              const desc = document.createElement("p");
              const descHeading = document.createElement("h2");
              if (categoryData.image) {
                const unitImg = document.createElement("img");
                unitImg.src = webPage + categoryData.image; // add source of image as webPage + the url of image
                txtContent.append(unitImg);
              } else {
                console.log("No Image was found");
              }
              desc.classList.add("linkStyle");
              descHeading.classList.add("linkStyle");
              desc.id = categoryData.name; // Add unique ID to each entry
              descHeading.textContent =
                categoryData.full_name || categoryData.index; // Add full name to heading
              desc.textContent = categoryData.desc; // add description to textcontent
              txtContent.append(descHeading, desc);
              txtContent.appendChild(document.createElement("br"));
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
