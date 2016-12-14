import contract from "../../src/contract";

describe( "Contract", () => {
	it( "should validate as true", function ( ) {
		var res = contract.verifyContract( require( "./test-contracts/get-apps-success.json" ).response, stubResponse ); // eslint-disable-line
		expect( res ).to.equal( true );
	} );
	it( "should validate as false", function ( ) {
		var res = contract.verifyContract( require( "./test-contracts/get-apps-fail.json" ).response, stubResponse ); // eslint-disable-line
		expect( res ).to.equal( false );
	} );
	it( "should validate as true", function ( ) {
		var res = contract.runContract( stub404, stub404.response ); // eslint-disable-line
		expect( res.status ).to.equal( "success" );
	} );
} );

const stub404 = {
		request: {
			url: "dummy"
		},
		response: {
			statusCode: 404,
			body: "Cannot GET /v0/components/n"
		}
};

const stubResponse = {
				statusCode: 200,
				body: {
					"links": {
						"self": "/apps/"
					},
					"data": [
						{
							"type": "App",
							"id": "00229b8a-89d8-432e-ad72-44ad12446d7e",
							"attributes": {
								"createdDate": "2015-11-26T15:01:30.260Z",
								"modifiedDate": "2015-12-14T11:45:50.098Z",
								"modifiedByUserName": "doecorp\\doe",
								"customProperties": [
								],
								"name": "My name is John",
								"appId": "",
								"publishTime": "2015-12-14T11:45:49.674Z",
								"published": true,
								"tags": [
								],
								"description": "This app extracts data to QVDs only",
								"fileSize": 124465,
								"lastReloadTime": "2016-01-04T12:18:41.000Z",
								"thumbnail": "",
								"savedInProductVersion": "2.2.0",
								"migrationHash": "",
								"dynamicColor": "",
								"availabilityStatus": 1,
								"privileges": [
									"read"
								],
								"schemaPath": "App"
							},
							"relationships": {
								"owner": {
									"data": {
										"type": "User",
										"id": "369ffd2b-8aa9-403c-84a3-3aa9fe10e009"
									}
								},
								"stream": {
									"data": {
										"type": "Stream",
										"id": "aaec8d41-5201-43ab-809f-3063750dfafd"
									}
								}
							}
						},
						{
							"type": "App",
							"id": "146bdd52-3a97-43ef-b9a6-67060436f5db",
							"attributes": {
								"name": "apa(2)",
								"privileges": [
									"create",
									"read",
									"update",
									"delete",
									"publish",
									"changeowner",
									"exportdata"
								],
								"lastReloadTime": "2016-03-31T11:20:13.110Z",
								"createdDate": "2016-03-31T11:10:02.885Z",
								"publishTime": "1753-01-01T00:00:00.000Z",
								"published": false,
								"description": "dksfjksdlgjk\ng\nfd\nsg\nd\ng\nfd\nh\nfg\nh\ngf\nj\ngh\nj\ngh\nk\nhj\nk\nhjk\nhj\nl\nj\nfdh\nfgjlghjkhgkgjlfgkjl",
								"dynamicColor": "",
								"thumbnail": ""
							},
							"relationships": {
								"owner": {
									"data": {
										"type": "User",
										"id": "369ffd2b-8aa9-403c-84a3-3aa9fe10e009"
									}
								},
								"stream": {
									"data": null
								}
							}
						},
						{
							"type": "App",
							"id": "0552a8a6-5b2e-43f6-a5b2-952986515481",
							"attributes": {
								"createdDate": "2015-11-23T14:56:43.310Z",
								"modifiedDate": "2015-12-14T11:45:48.728Z",
								"modifiedByUserName": "somedomain\\someone",
								"customProperties": [
								],
								"name": "My App 14",
								"appId": "",
								"publishTime": "2015-12-14T11:45:48.631Z",
								"published": true,
								"tags": [
								],
								"description": "",
								"fileSize": 124290,
								"lastReloadTime": "1753-01-01T00:00:00.000Z",
								"thumbnail": "",
								"savedInProductVersion": "2.2.0",
								"migrationHash": "",
								"dynamicColor": "",
								"availabilityStatus": 1,
								"privileges": [
									"read"
								],
								"schemaPath": "App"
							},
							"relationships": {
								"owner": {
									"data": {
										"type": "User",
										"id": "369ffd2b-8aa9-403c-84a3-3aa9fe10e009"
									}
								},
								"stream": {
									"data": {
										"type": "Stream",
										"id": "aaec8d41-5201-43ab-809f-3063750dfafd"
									}
								}
							}
						},
						{
							"type": "App",
							"id": "9757dd0f-c516-450b-b1fa-03116c3719f5",
							"attributes": {
								"name": "qwerty",
								"privileges": [
									"create",
									"read",
									"update",
									"delete",
									"publish",
									"changeowner",
									"exportdata"
								],
								"lastReloadTime": "1753-01-01T00:00:00.000Z",
								"createdDate": "2016-03-30T11:18:26.413Z",
								"publishTime": "1753-01-01T00:00:00.000Z",
								"published": false,
								"description": "",
								"dynamicColor": "",
								"thumbnail": ""
							},
							"relationships": {
								"owner": {
									"data": {
										"type": "User",
										"id": "369ffd2b-8aa9-403c-84a3-3aa9fe10e009"
									}
								},
								"stream": {
									"data": null
								}
							}
						},
						{
							"type": "App",
							"id": "68486444-bf28-4fca-b907-c22754ffa02a",
							"attributes": {
								"name": "Yet another app",
								"privileges": [
									"create",
									"read",
									"update",
									"delete",
									"publish",
									"changeowner",
									"exportdata"
								],
								"lastReloadTime": "1753-01-01T00:00:00.000Z",
								"createdDate": "2016-03-30T11:18:47.916Z",
								"publishTime": "1753-01-01T00:00:00.000Z",
								"published": false,
								"description": "dds\ngf\nfdh\n\ndfh\ngf\nj\nhg\n\nkjh\ng\nj\nhd\nh\nfdh\nfd\nh\nfg\nh\nf\nh\nfd\nh\nfdh\nfd\nh\nfd\nh\nfd\nh\ndfh\ndf\nh\nfd\nh\nfd\nh\nfdh\nd",
								"dynamicColor": "",
								"thumbnail": "/content/Default/Qlik_default_leaf.png"
							},
							"relationships": {
								"owner": {
									"data": {
										"type": "User",
										"id": "369ffd2b-8aa9-403c-84a3-3aa9fe10e009"
									}
								},
								"stream": {
									"data": null
								}
							}
						},
						{
							"type": "App",
							"id": "0b8cece4-0791-4ac0-8f18-00a22b5d2b23",
							"attributes": {
								"createdDate": "2015-12-09T11:41:08.694Z",
								"modifiedDate": "2015-12-14T11:45:50.170Z",
								"modifiedByUserName": "doecorp\\doe",
								"customProperties": [
								],
								"name": "asdasd",
								"appId": "",
								"publishTime": "2015-12-14T11:45:49.776Z",
								"published": true,
								"tags": [
								],
								"description": "",
								"fileSize": 124467,
								"lastReloadTime": "1753-01-01T00:00:00.000Z",
								"thumbnail": "",
								"savedInProductVersion": "2.2.0",
								"migrationHash": "",
								"dynamicColor": "",
								"availabilityStatus": 1,
								"privileges": [
									"read"
								],
								"schemaPath": "App"
							},
							"relationships": {
								"owner": {
									"data": {
										"type": "User",
										"id": "f5190907-971d-4e6a-81f1-a04c385af4ff"
									}
								},
								"stream": {
									"data": {
										"type": "Stream",
										"id": "aaec8d41-5201-43ab-809f-3063750dfafd"
									}
								}
							}
						}
					],
					"included": [
						{
							"type": "User",
							"id": "369ffd2b-8aa9-403c-84a3-3aa9fe10e009",
							"attributes": {
								"userId": "mmm",
								"userDirectory": "MyDomain",
								"name": "My Name",
								"privileges": null
							}
						},
						{
							"type": "User",
							"id": "f5190907-971d-4e6a-81f1-a04c385af4ff",
							"attributes": {
								"userId": "doe",
								"userDirectory": "doecorp",
								"name": "John Doe",
								"privileges": null
							}
						},
						{
							"type": "Stream",
							"id": "aaec8d41-5201-43ab-809f-3063750dfafd",
							"attributes": {
								"name": "Everyone",
								"privileges": [
									"read",
									"publish"
								]
							}
						}
					]
				}
			};
