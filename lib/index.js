"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const core_1 = __importDefault(require("@actions/core"));
const action_1 = __importDefault(require("./action"));
action_1.default.action().catch(error => {
    core_1.default.setFailed(error.message);
});
