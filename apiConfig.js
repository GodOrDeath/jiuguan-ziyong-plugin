// lib/apiConfig.js
// 负责：读写自定义 OpenAI 格式 API 配置，以及连通性测试

const MODULE = "worldbookAutoTracker";

export const DEFAULT_SETTINGS = {
    enabled: false,
    api: {
        baseUrl: "",
        apiKey: "",
        model: "",
    },
    bookNameTemplate: "AutoTracker_{{char}}",
    rules: [], // 下一步再填充（正则规则）
};

/**
 * 确保 extension_settings 中存在本插件的配置节点，
 * 并对缺失字段做兼容补全（防止旧版本用户升级后报错）。
 */
export function ensureSettings(extension_settings) {
    if (!extension_settings[MODULE]) {
        extension_settings[MODULE] = structuredClone(DEFAULT_SETTINGS);
    } else {
        // 浅层补全，避免旧配置缺字段
        extension_settings[MODULE] = {
            ...structuredClone(DEFAULT_SETTINGS),
            ...extension_settings[MODULE],
            api: {
                ...DEFAULT_SETTINGS.api,
                ...(extension_settings[MODULE].api || {}),
            },
        };
    }
    return extension_settings[MODULE];
}

/**
 * 测试自定义 OpenAI 格式 API 是否可用。
 * 直接调用 /chat/completions，发一条最小化的探测请求。
 */
export async function testConnection({ baseUrl, apiKey, model }) {
    if (!baseUrl || !model) {
        return { ok: false, message: "请先填写 Base URL 和模型名称" };
    }

    const url = baseUrl.replace(/\/+$/, "") + "/chat/completions";

    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: "ping" }],
                max_tokens: 1,
            }),
        });

        if (!resp.ok) {
            const errText = await safeReadText(resp);
            return { ok: false, message: `HTTP ${resp.status}: ${errText || resp.statusText}` };
        }

        return { ok: true, message: "连接成功" };
    } catch (err) {
        return { ok: false, message: `请求失败: ${err.message}` };
    }
}

async function safeReadText(resp) {
    try {
        return await resp.text();
    } catch {
        return "";
    }
}

/**
 * 通用调用封装，供后续「信息提取」步骤复用。
 */
export async function callChatCompletion({ baseUrl, apiKey, model }, messages, extra = {}) {
    const url = baseUrl.replace(/\/+$/, "") + "/chat/completions";
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
            model,
            messages,
            ...extra,
        }),
    });

    if (!resp.ok) {
        const errText = await safeReadText(resp);
        throw new Error(`API请求失败 HTTP ${resp.status}: ${errText || resp.statusText}`);
    }

    return resp.json();
}
