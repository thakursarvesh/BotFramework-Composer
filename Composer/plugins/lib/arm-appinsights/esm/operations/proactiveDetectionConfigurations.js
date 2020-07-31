/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is
 * regenerated.
 */
import { __assign } from "tslib";
import * as msRest from "@azure/ms-rest-js";
import * as Mappers from "../models/proactiveDetectionConfigurationsMappers";
import * as Parameters from "../models/parameters";
/** Class representing a ProactiveDetectionConfigurations. */
var ProactiveDetectionConfigurations = /** @class */ (function () {
    /**
     * Create a ProactiveDetectionConfigurations.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    function ProactiveDetectionConfigurations(client) {
        this.client = client;
    }
    ProactiveDetectionConfigurations.prototype.list = function (resourceGroupName, resourceName, options, callback) {
        return this.client.sendOperationRequest({
            resourceGroupName: resourceGroupName,
            resourceName: resourceName,
            options: options
        }, listOperationSpec, callback);
    };
    ProactiveDetectionConfigurations.prototype.get = function (resourceGroupName, resourceName, configurationId, options, callback) {
        return this.client.sendOperationRequest({
            resourceGroupName: resourceGroupName,
            resourceName: resourceName,
            configurationId: configurationId,
            options: options
        }, getOperationSpec, callback);
    };
    ProactiveDetectionConfigurations.prototype.update = function (resourceGroupName, resourceName, configurationId, proactiveDetectionProperties, options, callback) {
        return this.client.sendOperationRequest({
            resourceGroupName: resourceGroupName,
            resourceName: resourceName,
            configurationId: configurationId,
            proactiveDetectionProperties: proactiveDetectionProperties,
            options: options
        }, updateOperationSpec, callback);
    };
    return ProactiveDetectionConfigurations;
}());
export { ProactiveDetectionConfigurations };
// Operation Specifications
var serializer = new msRest.Serializer(Mappers);
var listOperationSpec = {
    httpMethod: "GET",
    path: "subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Insights/components/{resourceName}/ProactiveDetectionConfigs",
    urlParameters: [
        Parameters.resourceGroupName,
        Parameters.subscriptionId,
        Parameters.resourceName
    ],
    queryParameters: [
        Parameters.apiVersion
    ],
    headerParameters: [
        Parameters.acceptLanguage
    ],
    responses: {
        200: {
            bodyMapper: {
                serializedName: "parsedResponse",
                type: {
                    name: "Sequence",
                    element: {
                        type: {
                            name: "Composite",
                            className: "ApplicationInsightsComponentProactiveDetectionConfiguration"
                        }
                    }
                }
            }
        },
        default: {
            bodyMapper: Mappers.CloudError
        }
    },
    serializer: serializer
};
var getOperationSpec = {
    httpMethod: "GET",
    path: "subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Insights/components/{resourceName}/ProactiveDetectionConfigs/{ConfigurationId}",
    urlParameters: [
        Parameters.resourceGroupName,
        Parameters.subscriptionId,
        Parameters.resourceName,
        Parameters.configurationId
    ],
    queryParameters: [
        Parameters.apiVersion
    ],
    headerParameters: [
        Parameters.acceptLanguage
    ],
    responses: {
        200: {
            bodyMapper: Mappers.ApplicationInsightsComponentProactiveDetectionConfiguration
        },
        default: {
            bodyMapper: Mappers.CloudError
        }
    },
    serializer: serializer
};
var updateOperationSpec = {
    httpMethod: "PUT",
    path: "subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Insights/components/{resourceName}/ProactiveDetectionConfigs/{ConfigurationId}",
    urlParameters: [
        Parameters.resourceGroupName,
        Parameters.subscriptionId,
        Parameters.resourceName,
        Parameters.configurationId
    ],
    queryParameters: [
        Parameters.apiVersion
    ],
    headerParameters: [
        Parameters.acceptLanguage
    ],
    requestBody: {
        parameterPath: "proactiveDetectionProperties",
        mapper: __assign(__assign({}, Mappers.ApplicationInsightsComponentProactiveDetectionConfiguration), { required: true })
    },
    responses: {
        200: {
            bodyMapper: Mappers.ApplicationInsightsComponentProactiveDetectionConfiguration
        },
        default: {
            bodyMapper: Mappers.CloudError
        }
    },
    serializer: serializer
};
//# sourceMappingURL=proactiveDetectionConfigurations.js.map