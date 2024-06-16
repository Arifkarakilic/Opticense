# Opticense

Opticense is a command line tool for comparing and finding the license texts of dependencies in your project.

## Notice

This tool is under development and does not claim the accuracy of the findings. It will not provide you with legal advice. If the scanned license matches an existing license, it can provide the output, but it will not make any inferences about the license. What you do with the licenses is your responsibility. No responsibility is taken for any issues that may arise from using this tool. It is an open-source code created solely for ease of use.

## Usage

### On the command line

Pre-built exe files are available in the Releases section of GitHub. Users who want to use the npm package version can also install it by saying "npm install Opticense".
Basic usage:

    Opticense crawl <folderpath>

Here, `<folderpath>` is the main directory of the project to be analyzed. Opticense can scan through the package manager folders. If it cannot access the directory or if there is no package manager folder, it will not be able to perform the scan.

## Details

### Implementation

**tl;dr**: Jaccard Similarity Algorithm, cache file

Opticense extracts the content of license files and compares them with cached texts. This comparison is done by matching with a license that has a similarity score above a specified threshold based on the [Jaccard Similarity Algorithm](https://en.wikipedia.org/wiki/Jaccard_index) A single match may yield multiple similarity options. To reduce the number of similarity options, you can increase the threshold value (coming soon)

### How were licenses selected?

Licenses were selected by looking at key licenses in Synopsys [Top 20 Open Source Licenses 2022-23](https://www.synopsys.com/blogs/software-security/top-open-source-licenses.html) article

## Contributing

Contributions are very welcome! See [CONTRIBUTING](CONTRIBUTING.md) for more info.

## License

This library is licensed under the [GPL-3.0 license](LICENSE).
