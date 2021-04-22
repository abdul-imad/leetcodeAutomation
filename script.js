const puppeteer = require("puppeteer");
let cTab;
(async function fn() {
	try {
		let browserOpenPromise = puppeteer.launch({
			headless: false,
			defaultViewport: null,
			args: ["--start-maximized"],
		});
		let browser = await browserOpenPromise;
		let allTabsArr = await browser.pages();

		cTab = allTabsArr[0];
		let tab2 = await browser.newPage();
		let tab3 = await browser.newPage();

		await tab3.goto("https://www.rapidtables.com/tools/notepad.html"); //notepad

		await cTab.bringToFront();
		await cTab.goto("https://leetcode.com/problemset/all/"); // URL

		await cTab.waitForSelector(".auth-links__3huC > a:nth-child(3)"); // signin btn wait
		await cTab.click(".auth-links__3huC > a:nth-child(3)"); // signin btn clicked

		await cTab.waitForSelector("#id_login", { visibility: true });
		await cTab.type("#id_login", "abdulhameedpractice");
		await cTab.type("#id_password", "29Rajab@1419");
		await cTab.click(".btn-content-container__177h>.btn-content__10Tj"); // submit btn clicked

		await cTab.waitForNavigation();

		await cTab.waitForSelector(".filterStatus>button"); // Status btn wait
		await cTab.click(".filterStatus>button"); // Status btn clicked

		await cTab.evaluate(consoleFn, ".filter-dropdown-menu-item"); // function selecting solved

		let length = await cTab.evaluate(getCurrentPageLength, "tr"); // stores length of problem rows

		let probLink;

		while (length % 50 === 0) {
			for (let i = 0; i < 50; i++) {
				probLink = await cTab.evaluate(probFn, i); // gets the problem link of the question

				await tab2.bringToFront();
				await tab2.goto(probLink); // opens link in new tab

				await tab2.waitForSelector(
					".css-1lelwtv-TabHeader.e5i1odf4:nth-child(4)",
					{ visibility: true }
				);
				await tab2.click(".css-1lelwtv-TabHeader.e5i1odf4:nth-child(4)"); // submissions tab is opened

				let acceptedSubLink = await tab2.evaluate(
					acceptedSubmission,
					".ant-table-row.ant-table-row-level-0"
				);
				await tab2.goto(acceptedSubLink);
				await tab2.click("#edit-code-btn");
				await tab2.waitForSelector(".CodeMirror-code:nth-child(5)", {
					visibility: true,
				});
				let probName = await tab2.evaluate(
					getProblemName,
					"[data-cy='question-title']"
				);
				console.log(probName);

				await tab2.click(".CodeMirror-code:nth-child(5)");

				await tab2.keyboard.down("Control");
				await tab2.keyboard.press("a");
				await tab2.keyboard.press("c");
				if (i === 0) {
					await tab3.click("#main>textarea#area.notes");
				}
				await tab3.keyboard.press("Enter");

				await tab3.type("#main>textarea#area.notes", probName + " :   ");

				await tab3.keyboard.press("Enter");

				await tab3.keyboard.down("Control");
				await tab3.keyboard.press("v");
				await tab3.keyboard.up("Control");
			}
			await cTab.click("a.reactable-next-page"); // btn clicked for next set of problems

			await cTab.bringToFront();
			length = await cTab.evaluate(getCurrentPageLength, "tr"); // stores length of problem rows
		}

		// same while loop logic is run for last set of problems
		for (let i = 0; i < length; i++) {
			probLink = await cTab.evaluate(probFn, i); // gets the problem link of the question

			await tab2.bringToFront();

			await tab2.goto(probLink); // opens link in new tab
			await tab2.waitForSelector(
				".css-1lelwtv-TabHeader.e5i1odf4:nth-child(4)",
				{ visibility: true }
			);
			await tab2.click(".css-1lelwtv-TabHeader.e5i1odf4:nth-child(4)"); // submissions tab is opened
			let acceptedSubLink = await tab2.evaluate(
				acceptedSubmission,
				".ant-table-row.ant-table-row-level-0"
			);

			await tab2.goto(acceptedSubLink);
			await tab2.click("#edit-code-btn");
			await tab2.waitForSelector(".CodeMirror-code:nth-child(5)", {
				visibility: true,
			});
			let probName = await tab2.evaluate(
				getProblemName,
				"[data-cy='question-title']"
			);

			console.log(probName);

			await tab2.click(".CodeMirror-code:nth-child(5)");

			await tab2.keyboard.down("Control");
			await tab2.keyboard.press("a");
			await tab2.keyboard.press("c");
			if (i === 0) {
				await tab3.click("#main>textarea#area.notes");
			}
			await tab3.keyboard.press("Enter");
            await tab3.keyboard.press("Enter");

			await tab3.type("#main>textarea#area.notes", probName + " :   ");

			await tab3.keyboard.press("Enter");

			await tab3.keyboard.down("Control");
			await tab3.keyboard.press("v");
			await tab3.keyboard.up("Control");
		}
	} catch (err) {
		console.error(err);
	}
})();

function getProblemName(selector) {
	let probName = document
		.querySelector(selector)
		.innerText.split(". ")[1]
		.trim();
	return probName;
}

function acceptedSubmission(selector) {
	let allSubmitRows = document.querySelectorAll(selector);
	for (let i = 0; i < allSubmitRows.length; i++) {
		let acceptedLink = allSubmitRows[i].querySelectorAll("td>a")[0].href;

		let acceptedCol = allSubmitRows[i].querySelectorAll("td")[1].innerText;
		if (acceptedCol === "Accepted") {
			return acceptedLink;
		}
	}
}

function getCurrentPageLength(rows) {
	let allRows = document.querySelectorAll(rows);
	let length = allRows.length - 2;
	return length;
}

function probFn(idx) {
	let probLink = document.querySelectorAll("td>div>a")[idx].href;
	return probLink;
}

function consoleFn(selectors) {
	console.log("1");
	let all = document.querySelectorAll(selectors);
	console.log("2");
	let text;
	for (let i = 0; i < all.length; i++) {
		text = all[i].innerText.split("d")[0];
		console.log("3");
		if (text === "Solve") {
			console.log(text);
			return all[i].click();
		}
	}
}
