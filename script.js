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

//getData(apiEndpoint);

// Gets all categories in DND
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
    const categoryLink = document.createElement("a");
    categoryLink.classList.add("linkStyle");
    categoryLink.textContent = element + "\n";
    txtContent.append(categoryLink);
    categoryLink.addEventListener("click", async () => {
      try {
        const categoryRes = await fetch(webPage + data[element]); // Use value from original data
        const categoryData = await categoryRes.json();

        clearContent(txtContent); // Clear old content

        categoryData.results.forEach((entry) => {
          const entryLink = document.createElement("a");
          entryLink.classList.add("linkStyle");
          entryLink.id = entry.name; // Add unique ID to each entry
          entryLink.href = webPage + entry.url;
          entryLink.textContent = entry.name || entry.index;
          entryLink.target = "_blank";
          txtContent.appendChild(entryLink);
          txtContent.appendChild(document.createElement("br"));
        });
      } catch (error) {
        console.log(`Failed to fetch ${category}:`, error);
      }
    });
  }
  return container4Categories;
}
// Function to extract information about the category after you have clicked one of the categories
async function getInformationFromCat(urlAdress) {
  const getInfoFromCat = await getCategories(urlAddress);
  getInfoFromCat.forEach((cat) => {
    console.log(
      "This is category name: " + cat.name + " This is category URL: " + cat.url
    );
  });
}
console.log("This is categories: ", getCategories(apiEndpoint));
console.log("This is getInformationFromCat: ", getInformationFromCat());
// Function to clear elements
function clearContent(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
