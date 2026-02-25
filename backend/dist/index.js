"use strict";
/**
 * Main Entry Point
 *
 * Exports all services, handlers, and utilities for the AI Triage Engine.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.config = exports.getEmergencyContactHandler = exports.updateEmergencyStatusHandler = exports.getEmergencyCasesHandler = exports.detectLanguageHandler = exports.textToSpeechHandler = exports.speechToTextHandler = exports.confirmRegistrationHandler = exports.validateTokenHandler = exports.registerHandler = exports.loginHandler = exports.triageHandler = exports.authService = exports.emergencyService = exports.voiceService = exports.dynamoDBService = exports.bedrockService = void 0;
// Services
var bedrock_service_1 = require("./services/bedrock.service");
Object.defineProperty(exports, "bedrockService", { enumerable: true, get: function () { return bedrock_service_1.bedrockService; } });
var dynamodb_service_1 = require("./services/dynamodb.service");
Object.defineProperty(exports, "dynamoDBService", { enumerable: true, get: function () { return dynamodb_service_1.dynamoDBService; } });
var voice_service_1 = require("./services/voice.service");
Object.defineProperty(exports, "voiceService", { enumerable: true, get: function () { return voice_service_1.voiceService; } });
var emergency_service_1 = require("./services/emergency.service");
Object.defineProperty(exports, "emergencyService", { enumerable: true, get: function () { return emergency_service_1.emergencyService; } });
var auth_service_1 = require("./services/auth.service");
Object.defineProperty(exports, "authService", { enumerable: true, get: function () { return auth_service_1.authService; } });
// Handlers
var triage_handler_1 = require("./handlers/triage.handler");
Object.defineProperty(exports, "triageHandler", { enumerable: true, get: function () { return triage_handler_1.handler; } });
var auth_handler_1 = require("./handlers/auth.handler");
Object.defineProperty(exports, "loginHandler", { enumerable: true, get: function () { return auth_handler_1.loginHandler; } });
Object.defineProperty(exports, "registerHandler", { enumerable: true, get: function () { return auth_handler_1.registerHandler; } });
Object.defineProperty(exports, "validateTokenHandler", { enumerable: true, get: function () { return auth_handler_1.validateTokenHandler; } });
Object.defineProperty(exports, "confirmRegistrationHandler", { enumerable: true, get: function () { return auth_handler_1.confirmRegistrationHandler; } });
var voice_handler_1 = require("./handlers/voice.handler");
Object.defineProperty(exports, "speechToTextHandler", { enumerable: true, get: function () { return voice_handler_1.speechToTextHandler; } });
Object.defineProperty(exports, "textToSpeechHandler", { enumerable: true, get: function () { return voice_handler_1.textToSpeechHandler; } });
Object.defineProperty(exports, "detectLanguageHandler", { enumerable: true, get: function () { return voice_handler_1.detectLanguageHandler; } });
var emergency_handler_1 = require("./handlers/emergency.handler");
Object.defineProperty(exports, "getEmergencyCasesHandler", { enumerable: true, get: function () { return emergency_handler_1.getEmergencyCasesHandler; } });
Object.defineProperty(exports, "updateEmergencyStatusHandler", { enumerable: true, get: function () { return emergency_handler_1.updateEmergencyStatusHandler; } });
Object.defineProperty(exports, "getEmergencyContactHandler", { enumerable: true, get: function () { return emergency_handler_1.getEmergencyContactHandler; } });
// Configuration
var aws_config_1 = require("./config/aws.config");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return __importDefault(aws_config_1).default; } });
// Logger
var logger_1 = require("./utils/logger");
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return logger_1.logger; } });
// Types
__exportStar(require("./types/triage.types"), exports);
// Errors
__exportStar(require("./utils/errors"), exports);
//# sourceMappingURL=index.js.map