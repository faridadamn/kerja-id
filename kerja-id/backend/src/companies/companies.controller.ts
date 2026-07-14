import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('industries')
  @ApiOperation({ summary: 'Get top industries' })
  async getTopIndustries() {
    return this.companiesService.getTopIndustries();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search companies' })
  async search(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.companiesService.search(query || '', page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company detail' })
  async findById(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }
}
