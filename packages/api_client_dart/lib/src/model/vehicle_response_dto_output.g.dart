// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const VehicleResponseDtoOutputStatusEnum
    _$vehicleResponseDtoOutputStatusEnum_ACTIVE =
    const VehicleResponseDtoOutputStatusEnum._('ACTIVE');
const VehicleResponseDtoOutputStatusEnum
    _$vehicleResponseDtoOutputStatusEnum_MAINTENANCE =
    const VehicleResponseDtoOutputStatusEnum._('MAINTENANCE');
const VehicleResponseDtoOutputStatusEnum
    _$vehicleResponseDtoOutputStatusEnum_INACTIVE =
    const VehicleResponseDtoOutputStatusEnum._('INACTIVE');

VehicleResponseDtoOutputStatusEnum _$vehicleResponseDtoOutputStatusEnumValueOf(
    String name) {
  switch (name) {
    case 'ACTIVE':
      return _$vehicleResponseDtoOutputStatusEnum_ACTIVE;
    case 'MAINTENANCE':
      return _$vehicleResponseDtoOutputStatusEnum_MAINTENANCE;
    case 'INACTIVE':
      return _$vehicleResponseDtoOutputStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<VehicleResponseDtoOutputStatusEnum>
    _$vehicleResponseDtoOutputStatusEnumValues = BuiltSet<
        VehicleResponseDtoOutputStatusEnum>(const <VehicleResponseDtoOutputStatusEnum>[
  _$vehicleResponseDtoOutputStatusEnum_ACTIVE,
  _$vehicleResponseDtoOutputStatusEnum_MAINTENANCE,
  _$vehicleResponseDtoOutputStatusEnum_INACTIVE,
]);

Serializer<VehicleResponseDtoOutputStatusEnum>
    _$vehicleResponseDtoOutputStatusEnumSerializer =
    _$VehicleResponseDtoOutputStatusEnumSerializer();

class _$VehicleResponseDtoOutputStatusEnumSerializer
    implements PrimitiveSerializer<VehicleResponseDtoOutputStatusEnum> {
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
  final Iterable<Type> types = const <Type>[VehicleResponseDtoOutputStatusEnum];
  @override
  final String wireName = 'VehicleResponseDtoOutputStatusEnum';

  @override
  Object serialize(
          Serializers serializers, VehicleResponseDtoOutputStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  VehicleResponseDtoOutputStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      VehicleResponseDtoOutputStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$VehicleResponseDtoOutput extends VehicleResponseDtoOutput {
  @override
  final String id;
  @override
  final String plateNumber;
  @override
  final String vehicleTypeId;
  @override
  final String? seatMapId;
  @override
  final BuiltList<String> amenityIds;
  @override
  final VehicleResponseDtoOutputStatusEnum status;
  @override
  final String? description;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  factory _$VehicleResponseDtoOutput(
          [void Function(VehicleResponseDtoOutputBuilder)? updates]) =>
      (VehicleResponseDtoOutputBuilder()..update(updates))._build();

  _$VehicleResponseDtoOutput._(
      {required this.id,
      required this.plateNumber,
      required this.vehicleTypeId,
      this.seatMapId,
      required this.amenityIds,
      required this.status,
      this.description,
      required this.createdAt,
      required this.updatedAt})
      : super._();
  @override
  VehicleResponseDtoOutput rebuild(
          void Function(VehicleResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VehicleResponseDtoOutputBuilder toBuilder() =>
      VehicleResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VehicleResponseDtoOutput &&
        id == other.id &&
        plateNumber == other.plateNumber &&
        vehicleTypeId == other.vehicleTypeId &&
        seatMapId == other.seatMapId &&
        amenityIds == other.amenityIds &&
        status == other.status &&
        description == other.description &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, plateNumber.hashCode);
    _$hash = $jc(_$hash, vehicleTypeId.hashCode);
    _$hash = $jc(_$hash, seatMapId.hashCode);
    _$hash = $jc(_$hash, amenityIds.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'VehicleResponseDtoOutput')
          ..add('id', id)
          ..add('plateNumber', plateNumber)
          ..add('vehicleTypeId', vehicleTypeId)
          ..add('seatMapId', seatMapId)
          ..add('amenityIds', amenityIds)
          ..add('status', status)
          ..add('description', description)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt))
        .toString();
  }
}

class VehicleResponseDtoOutputBuilder
    implements
        Builder<VehicleResponseDtoOutput, VehicleResponseDtoOutputBuilder> {
  _$VehicleResponseDtoOutput? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

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

  VehicleResponseDtoOutputStatusEnum? _status;
  VehicleResponseDtoOutputStatusEnum? get status => _$this._status;
  set status(VehicleResponseDtoOutputStatusEnum? status) =>
      _$this._status = status;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  VehicleResponseDtoOutputBuilder() {
    VehicleResponseDtoOutput._defaults(this);
  }

  VehicleResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _plateNumber = $v.plateNumber;
      _vehicleTypeId = $v.vehicleTypeId;
      _seatMapId = $v.seatMapId;
      _amenityIds = $v.amenityIds.toBuilder();
      _status = $v.status;
      _description = $v.description;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VehicleResponseDtoOutput other) {
    _$v = other as _$VehicleResponseDtoOutput;
  }

  @override
  void update(void Function(VehicleResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VehicleResponseDtoOutput build() => _build();

  _$VehicleResponseDtoOutput _build() {
    _$VehicleResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$VehicleResponseDtoOutput._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'VehicleResponseDtoOutput', 'id'),
            plateNumber: BuiltValueNullFieldError.checkNotNull(
                plateNumber, r'VehicleResponseDtoOutput', 'plateNumber'),
            vehicleTypeId: BuiltValueNullFieldError.checkNotNull(
                vehicleTypeId, r'VehicleResponseDtoOutput', 'vehicleTypeId'),
            seatMapId: seatMapId,
            amenityIds: amenityIds.build(),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'VehicleResponseDtoOutput', 'status'),
            description: description,
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'VehicleResponseDtoOutput', 'createdAt'),
            updatedAt: BuiltValueNullFieldError.checkNotNull(
                updatedAt, r'VehicleResponseDtoOutput', 'updatedAt'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'amenityIds';
        amenityIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'VehicleResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
