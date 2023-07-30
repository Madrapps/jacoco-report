"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const action_1 = require("./action");
(0, action_1.action)().catch(error => {
    console.log(`error: ${error}`);
    console.log(`core is null?: ${core_1.default == null}`);
    core_1.default.setFailed(error.message);
});
