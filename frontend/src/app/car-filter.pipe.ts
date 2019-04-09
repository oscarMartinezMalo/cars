import { Pipe, PipeTransform } from '@angular/core';
import { Car } from './Car';

@Pipe({
    name: 'carFilter'
})

export class CarFilterPipe implements PipeTransform {
    transform(cars: Car[], searchTerm: string) {
        if (!cars || !searchTerm) {
            return cars;
        }
        return cars.filter(it => it['car-name'].toLowerCase().includes(searchTerm));
    }
}