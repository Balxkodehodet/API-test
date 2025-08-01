// Defining constants
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
    getCategories(data);
  } catch (error) {
    console.log("failed to fetch, error", error);
  }
}

getData(apiEndpoint);

function getCategories(data) {
  for (let category in data) {
    //console.log(category);
    const categoryLink = document.createElement("a");
    // categoryLink.href = webPage + category;
    categoryLink.classList.add("linkStyle");
    categoryLink.textContent = category + "\n";
    txtContent.append(categoryLink);
    categoryLink.addEventListener("click", async () => {
      try {
        const categoryRes = await fetch(webPage + data[category]); // Use value from original data
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
}
// Function to clear elements
function clearContent(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
