// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const VehicleListResponseDtoOutputItemsInnerStatusEnum
    _$vehicleListResponseDtoOutputItemsInnerStatusEnum_ACTIVE =
    const VehicleListResponseDtoOutputItemsInnerStatusEnum._('ACTIVE');
const VehicleListResponseDtoOutputItemsInnerStatusEnum
    _$vehicleListResponseDtoOutputItemsInnerStatusEnum_MAINTENANCE =
    const VehicleListResponseDtoOutputItemsInnerStatusEnum._('MAINTENANCE');
const VehicleListResponseDtoOutputItemsInnerStatusEnum
    _$vehicleListResponseDtoOutputItemsInnerStatusEnum_INACTIVE =
    const VehicleListResponseDtoOutputItemsInnerStatusEnum._('INACTIVE');

VehicleListResponseDtoOutputItemsInnerStatusEnum
    _$vehicleListResponseDtoOutputItemsInnerStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$vehicleListResponseDtoOutputItemsInnerStatusEnum_ACTIVE;
    case 'MAINTENANCE':
      return _$vehicleListResponseDtoOutputItemsInnerStatusEnum_MAINTENANCE;
    case 'INACTIVE':
      return _$vehicleListResponseDtoOutputItemsInnerStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<VehicleListResponseDtoOutputItemsInnerStatusEnum>
    _$vehicleListResponseDtoOutputItemsInnerStatusEnumValues = BuiltSet<
        VehicleListResponseDtoOutputItemsInnerStatusEnum>(const <VehicleListResponseDtoOutputItemsInnerStatusEnum>[
  _$vehicleListResponseDtoOutputItemsInnerStatusEnum_ACTIVE,
  _$vehicleListResponseDtoOutputItemsInnerStatusEnum_MAINTENANCE,
  _$vehicleListResponseDtoOutputItemsInnerStatusEnum_INACTIVE,
]);

Serializer<VehicleListResponseDtoOutputItemsInnerStatusEnum>
    _$vehicleListResponseDtoOutputItemsInnerStatusEnumSerializer =
    _$VehicleListResponseDtoOutputItemsInnerStatusEnumSerializer();

class _$VehicleListResponseDtoOutputItemsInnerStatusEnumSerializer
    implements
        PrimitiveSerializer<VehicleListResponseDtoOutputItemsInnerStatusEnum> {
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
  final Iterable<Type> types = const <Type>[
    VehicleListResponseDtoOutputItemsInnerStatusEnum
  ];
  @override
  final String wireName = 'VehicleListResponseDtoOutputItemsInnerStatusEnum';

  @override
  Object serialize(Serializers serializers,
          VehicleListResponseDtoOutputItemsInnerStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  VehicleListResponseDtoOutputItemsInnerStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      VehicleListResponseDtoOutputItemsInnerStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$VehicleListResponseDtoOutputItemsInner
    extends VehicleListResponseDtoOutputItemsInner {
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
  final VehicleListResponseDtoOutputItemsInnerStatusEnum status;
  @override
  final String? description;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  factory _$VehicleListResponseDtoOutputItemsInner(
          [void Function(VehicleListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (VehicleListResponseDtoOutputItemsInnerBuilder()..update(updates))
          ._build();

  _$VehicleListResponseDtoOutputItemsInner._(
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
  VehicleListResponseDtoOutputItemsInner rebuild(
          void Function(VehicleListResponseDtoOutputItemsInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VehicleListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      VehicleListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VehicleListResponseDtoOutputItemsInner &&
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
    return (newBuiltValueToStringHelper(
            r'VehicleListResponseDtoOutputItemsInner')
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

class VehicleListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<VehicleListResponseDtoOutputItemsInner,
            VehicleListResponseDtoOutputItemsInnerBuilder> {
  _$VehicleListResponseDtoOutputItemsInner? _$v;

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

  VehicleListResponseDtoOutputItemsInnerStatusEnum? _status;
  VehicleListResponseDtoOutputItemsInnerStatusEnum? get status =>
      _$this._status;
  set status(VehicleListResponseDtoOutputItemsInnerStatusEnum? status) =>
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

  VehicleListResponseDtoOutputItemsInnerBuilder() {
    VehicleListResponseDtoOutputItemsInner._defaults(this);
  }

  VehicleListResponseDtoOutputItemsInnerBuilder get _$this {
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
  void replace(VehicleListResponseDtoOutputItemsInner other) {
    _$v = other as _$VehicleListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(VehicleListResponseDtoOutputItemsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VehicleListResponseDtoOutputItemsInner build() => _build();

  _$VehicleListResponseDtoOutputItemsInner _build() {
    _$VehicleListResponseDtoOutputItemsInner _$result;
    try {
      _$result = _$v ??
          _$VehicleListResponseDtoOutputItemsInner._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'VehicleListResponseDtoOutputItemsInner', 'id'),
            plateNumber: BuiltValueNullFieldError.checkNotNull(plateNumber,
                r'VehicleListResponseDtoOutputItemsInner', 'plateNumber'),
            vehicleTypeId: BuiltValueNullFieldError.checkNotNull(vehicleTypeId,
                r'VehicleListResponseDtoOutputItemsInner', 'vehicleTypeId'),
            seatMapId: seatMapId,
            amenityIds: amenityIds.build(),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'VehicleListResponseDtoOutputItemsInner', 'status'),
            description: description,
            createdAt: BuiltValueNullFieldError.checkNotNull(createdAt,
                r'VehicleListResponseDtoOutputItemsInner', 'createdAt'),
            updatedAt: BuiltValueNullFieldError.checkNotNull(updatedAt,
                r'VehicleListResponseDtoOutputItemsInner', 'updatedAt'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'amenityIds';
        amenityIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'VehicleListResponseDtoOutputItemsInner',
            _$failedField,
            e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
