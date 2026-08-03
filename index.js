// index.js
// SillyTavern 扩展入口
// 当前阶段目标：UI设置面板 + 自定义OpenAI格式API配置
// 后续阶段：正则提取规则、世界书写入、快照回滚（先留出接口位置）

import { extension_settings, getContext } from "../../../extensions.js";
import {
    ensureSettings,
    testConnection,
} from "./lib/apiConfig.js";

const MODULE = "worldbookAutoTracker";
const EXT_FOLDER = "jiuguan-ziyong-plugin"; // 需与GitHub仓库名/实际安装目录名一致

let settings;

/**
 * 加载 settings.html 并注入到扩展设置面板容器中
 */
async function loadSettingsUI() {
    const resp = await fetch(`/scripts/extensions/third-party/${EXT_FOLDER}/settings.html`);
    const html = await resp.text();
    $("#extensions_settings2").append(html);

    bindUIEvents();
    populateUIFromSettings();
}

/**
 * 把当前 settings 的值填充进表单控件
 */
function populateUIFromSettings() {
    $("#wat_enabled").prop("checked", !!settings.enabled);
    $("#wat_api_base").val(settings.api.baseUrl || "");
    $("#wat_api_key").val(settings.api.apiKey || "");
    $("#wat_api_model").val(settings.api.model || "");
    $("#wat_book_name_template").val(settings.bookNameTemplate || "AutoTracker_{{char}}");
}

/**
 * 从表单控件读取当前值，写回 settings 对象（不落盘，落盘由「保存设置」按钮触发）
 */
function readUIIntoSettings() {
    settings.enabled = $("#wat_enabled").prop("checked");
    settings.api.baseUrl = $("#wat_api_base").val().trim();
    settings.api.apiKey = $("#wat_api_key").val().trim();
    settings.api.model = $("#wat_api_model").val().trim();
    settings.bookNameTemplate = $("#wat_book_name_template").val().trim() || "AutoTracker_{{char}}";
}

function bindUIEvents() {
    $("#wat_test_connection").on("click", async () => {
        readUIIntoSettings();
        const $status = $("#wat_test_status");
        $status.text("测试中...").css("color", "");

        const result = await testConnection(settings.api);
        $status.text(result.message).css("color", result.ok ? "limegreen" : "tomato");
    });

    $("#wat_save_settings").on("click", () => {
        readUIIntoSettings();
        saveSettingsDebounced();
        $("#wat_save_status").text("已保存").css("color", "limegreen");
        setTimeout(() => $("#wat_save_status").text(""), 2000);
    });

    // 复选框即时生效（不需要点保存也能开关总开关）
    $("#wat_enabled").on("change", () => {
        settings.enabled = $("#wat_enabled").prop("checked");
        saveSettingsDebounced();
    });
}

/**
 * SillyTavern 提供的全局防抖保存函数，扩展也可直接使用。
 * 如果宿主环境未提供该函数，这里做一个兜底。
 */
function saveSettingsDebounced() {
    if (typeof window.saveSettingsDebounced === "function") {
        window.saveSettingsDebounced();
    }
}

/**
 * 扩展初始化入口
 */
jQuery(async () => {
    settings = ensureSettings(extension_settings);
    await loadSettingsUI();

    console.log(`[${MODULE}] 已加载 (阶段1: UI + API配置)`);

    // ---- 后续阶段占位 ----
    // TODO: 阶段2 - 正则规则导入/编辑UI + 提取引擎
    // TODO: 阶段3 - 事件绑定（CHARACTER_MESSAGE_RENDERED）+ 世界书写入
    // TODO: 阶段4 - 快照存储 + MESSAGE_SWIPED/MESSAGE_DELETED 回滚
});
