/* 监听 DOM 变化，获取预加载的图片 */

import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
	matches: ["*://weread.qq.com/web/reader/*"],
	run_at: "document_start",
	all_frames: true
}

function initDomChangeObserver() {
	const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
		console.log("mutationsList======")
		for (let mutation of mutationsList) {
			if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
				mutation.addedNodes.forEach((node: Node) => {
					if ((node as Element).matches && (node as Element).matches('div.preRenderContainer')) {
						// 获取当前章节标题
						const chapterTitle = document.querySelector('span.readerTopBar_title_chapter')?.textContent?.replace(/　|\s/g, '') ?? '';
						// 获取已存储的章节图片数据
						chrome.storage.local.get('chapterImgData', (result: any) => {
							const chapterImgData = result.chapterImgData || {};

							// 获取当前预渲染容器中的所有图片数据
							const imgElements = (node as Element).querySelectorAll('img');
							const imgData: { [key: string]: string } = {};
							imgElements.forEach((img: HTMLImageElement) => {
								const dataWrCo = img.getAttribute('data-wr-co');
								const dataSrc = img.getAttribute('data-src');
								if (dataWrCo && dataSrc) {
									chapterImgData[dataWrCo] = dataSrc;
								}
							});

							// 将更新后的数据存储到 chrome.storage.local 中
							chrome.storage.local.set({ chapterImgData: chapterImgData });
						});
					}
				});
			}
		}
	});

	// 开始监听节点变化
	observer.observe(document.body, { childList: true, subtree: true });

}

export { initDomChangeObserver };