// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_input_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const VehicleInputDtoStatusEnum _$vehicleInputDtoStatusEnum_ACTIVE =
    const VehicleInputDtoStatusEnum._('ACTIVE');
const VehicleInputDtoStatusEnum _$vehicleInputDtoStatusEnum_MAINTENANCE =
    const VehicleInputDtoStatusEnum._('MAINTENANCE');
const VehicleInputDtoStatusEnum _$vehicleInputDtoStatusEnum_INACTIVE =
    const VehicleInputDtoStatusEnum._('INACTIVE');

VehicleInputDtoStatusEnum _$vehicleInputDtoStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$vehicleInputDtoStatusEnum_ACTIVE;
    case 'MAINTENANCE':
      return _$vehicleInputDtoStatusEnum_MAINTENANCE;
    case 'INACTIVE':
      return _$vehicleInputDtoStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<VehicleInputDtoStatusEnum> _$vehicleInputDtoStatusEnumValues =
    BuiltSet<VehicleInputDtoStatusEnum>(const <VehicleInputDtoStatusEnum>[
  _$vehicleInputDtoStatusEnum_ACTIVE,
  _$vehicleInputDtoStatusEnum_MAINTENANCE,
  _$vehicleInputDtoStatusEnum_INACTIVE,
]);

Serializer<VehicleInputDtoStatusEnum> _$vehicleInputDtoStatusEnumSerializer =
    _$VehicleInputDtoStatusEnumSerializer();

class _$VehicleInputDtoStatusEnumSerializer
    implements PrimitiveSerializer<VehicleInputDtoStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'MAINTENANCE': 'MAINTENANCE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'MAINTENANCE': 'MAINTENANCE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[VehicleInputDtoStatusEnum];
  @override
  final String wireName = 'VehicleInputDtoStatusEnum';

  @override
  Object serialize(Serializers serializers, VehicleInputDtoStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  VehicleInputDtoStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      VehicleInputDtoStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$VehicleInputDto extends VehicleInputDto {
  @override
  final String plateNumber;
  @override
  final String vehicleTypeId;
  @override
  final String? seatMapId;
  @override
  final BuiltList<String> amenityIds;
  @override
  final VehicleInputDtoStatusEnum status;
  @override
  final String? description;

  factory _$VehicleInputDto([void Function(VehicleInputDtoBuilder)? updates]) =>
      (VehicleInputDtoBuilder()..update(updates))._build();

  _$VehicleInputDto._(
      {required this.plateNumber,
      required this.vehicleTypeId,
      this.seatMapId,
      required this.amenityIds,
      required this.status,
      this.description})
      : super._();
  @override
  VehicleInputDto rebuild(void Function(VehicleInputDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VehicleInputDtoBuilder toBuilder() => VehicleInputDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VehicleInputDto &&
        plateNumber == other.plateNumber &&
        vehicleTypeId == other.vehicleTypeId &&
        seatMapId == other.seatMapId &&
        amenityIds == other.amenityIds &&
        status == other.status &&
        description == other.description;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, plateNumber.hashCode);
    _$hash = $jc(_$hash, vehicleTypeId.hashCode);
    _$hash = $jc(_$hash, seatMapId.hashCode);
    _$hash = $jc(_$hash, amenityIds.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'VehicleInputDto')
          ..add('plateNumber', plateNumber)
          ..add('vehicleTypeId', vehicleTypeId)
          ..add('seatMapId', seatMapId)
          ..add('amenityIds', amenityIds)
          ..add('status', status)
          ..add('description', description))
        .toString();
  }
}

class VehicleInputDtoBuilder
    implements Builder<VehicleInputDto, VehicleInputDtoBuilder> {
  _$VehicleInputDto? _$v;

  String? _plateNumber;
  String? get plateNumber => _$this._plateNumber;
  set plateNumber(String? plateNumber) => _$this._plateNumber = plateNumber;

  String? _vehicleTypeId;
  String? get vehicleTypeId => _$this._vehicleTypeId;
  set vehicleTypeId(String? vehicleTypeId) =>
      _$this._vehicleTypeId = vehicleTypeId;

  String? _seatMapId;
  String? get seatMapId => _$this._seatMapId;
  set seatMapId(String? seatMapId) => _$this._seatMapId = seatMapId;

  ListBuilder<String>? _amenityIds;
  ListBuilder<String> get amenityIds =>
      _$this._amenityIds ??= ListBuilder<String>();
  set amenityIds(ListBuilder<String>? amenityIds) =>
      _$this._amenityIds = amenityIds;

  VehicleInputDtoStatusEnum? _status;
  VehicleInputDtoStatusEnum? get status => _$this._status;
  set status(VehicleInputDtoStatusEnum? status) => _$this._status = status;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  VehicleInputDtoBuilder() {
    VehicleInputDto._defaults(this);
  }

  VehicleInputDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _plateNumber = $v.plateNumber;
      _vehicleTypeId = $v.vehicleTypeId;
      _seatMapId = $v.seatMapId;
      _amenityIds = $v.amenityIds.toBuilder();
      _status = $v.status;
      _description = $v.description;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VehicleInputDto other) {
    _$v = other as _$VehicleInputDto;
  }

  @override
  void update(void Function(VehicleInputDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VehicleInputDto build() => _build();

  _$VehicleInputDto _build() {
    _$VehicleInputDto _$result;
    try {
      _$result = _$v ??
          _$VehicleInputDto._(
            plateNumber: BuiltValueNullFieldError.checkNotNull(
                plateNumber, r'VehicleInputDto', 'plateNumber'),
            vehicleTypeId: BuiltValueNullFieldError.checkNotNull(
                vehicleTypeId, r'VehicleInputDto', 'vehicleTypeId'),
            seatMapId: seatMapId,
            amenityIds: amenityIds.build(),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'VehicleInputDto', 'status'),
            description: description,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'amenityIds';
        amenityIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'VehicleInputDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
