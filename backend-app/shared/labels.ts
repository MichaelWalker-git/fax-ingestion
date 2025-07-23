import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class Labels {
  organization: string;
  environment: string;
  region: string;
  application: string;
  classification: string;
  delimiter: string;

  public constructor(
    org: string,
    env: string,
    region: string,
    application: string,
    classification: string,
    del: string,
  ) {
    this.organization = org;
    this.environment = env;
    this.region = region;
    this.application = application;
    this.classification = classification;
    this.delimiter = del;
  }

  public applyTags(scope: Construct) {
    cdk.Tags.of(scope).add(
      `${this.organization}:Environment`,
      this.environment,
    );
    cdk.Tags.of(scope).add(`${this.organization}:Region`, this.region);
    cdk.Tags.of(scope).add(
      `${this.organization}:Application`,
      this.application,
    );
    cdk.Tags.of(scope).add(
      `${this.organization}:Classification`,
      this.classification,
    );
  }

  public name(): string {
    return [
      this.organization,
      this.region,

      this.environment,
      this.application,
    ].join(this.delimiter);
  }
}
